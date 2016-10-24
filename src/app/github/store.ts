import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/repeat';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/observable/timer';

import {Injectable} from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {AngularFire, FirebaseAuth, FirebaseAuthState, FirebaseObjectObservable} from 'angularfire2';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

import {Event, Issue, LabelRef, PullRequest} from './v3';

const EVENTS = '/github_webhook_events';
const EVENTS_LEASE = '/github_webhook_events_lease';
const LEASE_TIME = 30 * 1000;

interface AcquireLockResult {
  isMaster: boolean;
  duration: number;
}

@Injectable()
export class GithubStore {
  isMaster: boolean = false;

  constructor(private af: AngularFire, private http: Http) {
    let [acquireLock, releaseLock] = this.acquireWebhookLock().partition((v) => v.isMaster);
    acquireLock.flatMap((_) => this.getWebhookEvents(1).map((i) => i[0]).filter((v) => !!v))
        .takeUntil(releaseLock)
        .subscribe((event: Event) => {
          this._consumeEvent(this.af.database.object(EVENTS + '/' + (event as any)['$key']));
        });
  }

  private _consumeEvent(event: FirebaseObjectObservable<Event>) {
    event.subscribe((e: Event) => {
      if (!e) return;
      console.log(e);
      switch (e.action) {
        case 'synchronize':
        case 'labeled':
        case 'unlabeled':
        case 'assigned':
        case 'unassigned':
        case 'opened':
        case 'closed':
        case 'reopened':
        case 'edited':
        case 'created':
        case 'deleted':
          if (e.issue) {
            this._updateObject(ISSUE_EXTRACTOR, e.issue);
            event.remove();
          } else if (e.pull_request) {
            this._updateObject(PR_EXTRACTOR, e.pull_request);
            event.remove();
          } else {
            console.error('unknown event: ', e);
          }
          break;
        case 'deleted':
          if (e.comment) {
            // We don't process comments
            event.remove();
          }
        default:
          console.error('unknown action: ' + (e.action));
      }
    });
  }

  getOpenPrDigests(): Observable<Digest[]> {
    return this.af.database.list(PR_EXTRACTOR.digestUrl + '/open');
  }

  getWebhookEvents(limitTo: number = 10): Observable<Event[]> {
    return this.af.database.list(EVENTS, {query: {limitToFirst: limitTo}});
  }

  acquireWebhookLock(): Observable<AcquireLockResult> {
    var eventsLease = this.af.database.object(EVENTS_LEASE);
    var ref: any = (<any>eventsLease)._ref;  // https://github.com/angular/angularfire2/issues/201
    var lastLease = -1;
    return new Observable<AcquireLockResult>((subscriber: Subscriber<AcquireLockResult>) => {
             var now = Date.now();
             var id: number;
             ref.transaction(
                 (expireTime: number = 0) => {
                   if (expireTime == lastLease || now > expireTime) {
                     return now + LEASE_TIME;
                   }
                 },
                 (error: any, committed: boolean, expirationTimeRef: any) => {
                   if (error) {
                     console.error(error);
                   } else {
                     var duration = expirationTimeRef.val() - now;
                     subscriber.next({isMaster: committed, duration: duration});
                     if (committed) {
                       lastLease = expirationTimeRef.val();
                       id = window.setTimeout(
                           () => subscriber.complete(), duration - LEASE_TIME * .1);
                     } else {
                       lastLease = -1;
                       id = window.setTimeout(() => subscriber.complete(), duration);
                     }
                   }
                 });
             return () => {
               clearTimeout(id);
               id = null;
             };
           })
        .repeat()
        .distinctUntilChanged((a, b) => a.isMaster == b.isMaster)
        .share();
  }

  updatePr(prNumber: number): void {
    this._update(PR_EXTRACTOR, prNumber);
  }

  updatePrs() {
    this._updateAll(PR_EXTRACTOR);
  }

  private _updateAll(extractor: Extractor): void {
    var fetchPage = (page: number) => {
      this._get(extractor.githubUrl, {page: page, state: 'all'})
          .subscribe((prsResponse: Response) => {
            var prs: PullRequest[] = prsResponse.json();
            prs.forEach((pr: PullRequest) => {
              this._updateObject(extractor, pr);
            });
            if (prs.length) fetchPage(page + 1);
          });
    };
    fetchPage(0);
  }

  private _update(extractor: Extractor, number: number): void {
    this._get(extractor.githubUrl + '/' + number)
        .subscribe(
            (prResponse: Response) => this._updateObject(extractor, prResponse.json()),
            (error: Response) => console.error(error));
    // TODO: how do I return FirebaseObjectObservable<PullRequest>?
  }

  private _updateObject(extractor: Extractor, prOrIssue: PullRequest|Issue): void {
    this._get(ISSUE_EXTRACTOR.githubUrl + '/' + prOrIssue.number + '/labels')
        .subscribe((res: Response) => {
          var labels = res.json();
          console.log('Updating: ', prOrIssue.number, labels);
          var db = this.af.database;
          var open = db.object(extractor.rawUrl + '/open/' + prOrIssue.number);
          var close = db.object(extractor.rawUrl + '/close/' + prOrIssue.number);
          var openDigest = db.object(extractor.digestUrl + '/open/' + prOrIssue.number);
          var closeDigest = db.object(extractor.digestUrl + '/close/' + prOrIssue.number);
          var digest = extractor.digest(prOrIssue, labels);
          if (prOrIssue.closed_at) {
            close.set(prOrIssue);
            closeDigest.set(digest);
            open.remove();
            openDigest.remove();
          } else {
            open.set(prOrIssue);
            openDigest.set(digest);
            close.remove();
            closeDigest.remove();
          }
        });
  }

  private _get(path: string, params: {[k: string]: any} = {}): Observable<Response> {
    return new Observable(observer => {
      this.af.auth.subscribe((authState: FirebaseAuthState) => {
        console.log(authState);

        var accessToken: string = authState.github.accessToken;
        var qParams: string[] = [];
        Object.keys(params).forEach((key) => qParams.push(key + '=' + params[key]));
        this.http
            .get(
                'https://api.github.com/repos/angular/angular' + path + '?' + qParams.join('&'),
                {headers: new Headers({'Authorization': 'token ' + accessToken})})
            .subscribe((prsResponse: Response) => {
              observer.next(prsResponse);
            });
      });
    });
  }
}

abstract class Extractor {
  githubUrl: string;
  rawUrl: string;
  digestUrl: string;

  digest(prOrIssue: PullRequest|Issue, labels: LabelRef[]): Digest {
    return {
      number: prOrIssue.number,
      title: prOrIssue.title,
      assigned: prOrIssue.assignee ? prOrIssue.assignee.login : null,
      author: prOrIssue.user ? prOrIssue.user.login : null,
      created_at: parseDate(prOrIssue.created_at),
      updated_at: parseDate(prOrIssue.updated_at),
      labels: extractLabels(labels),
      comments: prOrIssue.comments || 0
    };
  }
}

class PrExtractor extends Extractor {
  githubUrl = '/pulls';
  rawUrl = '/github/pulls';
  digestUrl = '/digest/pulls';
}

class IssueExtractor extends Extractor {
  githubUrl = '/issues';
  rawUrl = '/github/issues';
  digestUrl = '/digest/issues';
}

export interface Digest {
  number: number;
  title: string;
  assigned: string;
  author: string;
  created_at: number;
  updated_at: number;
  labels: {[key: string]: string};
  comments: number;
}

const LABEL_REGEXP = /^(\w+)(\d*):\s*(.*)$/;

function extractLabels(labels: LabelRef[]): {[key: string]: string} {
  var labelsMap: {[key: string]: string} = {};
  (labels || []).map((ref) => {
    var parts = LABEL_REGEXP.exec(ref.name);
    var key = parts[1];
    var value = parts[3];
    if (parts[2]) {
      value = parts[2] + ': ' + value;
    }
    labelsMap[key] = value;
  });
  console.log('Labels', labelsMap, labels);
  return labelsMap;
}

function parseDate(date: string): number {
  return date ? new Date(date).getTime() : null;
}

const PR_EXTRACTOR = new PrExtractor();
const ISSUE_EXTRACTOR = new IssueExtractor();
