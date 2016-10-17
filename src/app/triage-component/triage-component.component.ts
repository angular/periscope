import {Component, OnInit, Input} from '@angular/core';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from "@angular/forms";



const md = `
(c)

**I'm submitting a ...**  (check one with "x")
\`\`\`
  [ x ] bug report => search github for a similar issue or PR before submitting
  [ ] feature request
  [ ] support request => Please do not submit support request here, instead see https://github.com/angular/angular/blob/master/CONTRIBUTING.md#question
  \`\`\`

**Current behavior**
Hi, 
I followed the i18n documentation for its implementation within my application but the ng-xi18n throw the exception below :

I am having i18n attribute in places like :
\`\`\`html
  <span>
  <label i18n>Domain</label>
  <input [(ngModel)]="account.domain" type="text" name="domain" class="form-control" i18n>
</span>
\`\`\`

\`\`\`ts
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
\`\`\`

\`\`\`
$ node_modules/.bin/ng-xi18n -p src/tsconfig.json --i18nFormat=xmb
Error: parameters received {"filePath":"./node_modules/@angular/common/src/location/location.d.ts","name":"Location"} which is not a StaticSymbol
at StaticReflector.parameters (.\node_modules\@angular\compiler-cli\src\static_reflector.js:92:19)
at CompileMetadataResolver.getDependenciesMetadata (.\node_modules\@angular\compiler\bundles\compiler.umd.js:14190:56)
at CompileMetadataResolver.getTypeMetadata (.\node_modules\@angular\compiler\bundles\compiler.umd.js:14155:28)
at .\node_modules\@angular\compiler\bundles\compiler.umd.js:14298:43
at Array.forEach (native)
at CompileMetadataResolver.getProvidersMetadata (.\node_modules\@angular\compiler\bundles\compiler.umd.js:14278:21)
at .\node_modules\@angular\compiler\bundles\compiler.umd.js:14285:43
at Array.forEach (native)
at CompileMetadataResolver.getProvidersMetadata (.\node_modules\@angular\compiler\bundles\compiler.umd.js:14278:21)
at CompileMetadataResolver.getNgModuleMetadata (.\node_modules\@angular\compiler\bundles\compiler.umd.js:14037:60)
Extraction failed
  \`\`\`

**Please tell us about your environment:**

Windows 10 - win32 x64
Sublime Text 3
npm 3.10.3
Angular-cli: 1.0.0-beta.17
Webpack 2.1.0-beta.25

* **Angular version:** 2.0.X

* **Language:** [ TypeScript  Version 2.0.3 ]

* **Node (for AoT issues):** \`node --version\` = v6.5.0  

![aot_perf](https://cloud.githubusercontent.com/assets/12346501/19327782/9fe1d2ee-909e-11e6-8b1b-abb8370159bf.png)

`;



@Component({
  selector: 'triage-component',
  templateUrl: './triage-component.component.html',
  styleUrls: ['./triage-component.component.css']
})
export class TriageComponentComponent {
  @Input() issues: any[];

  form: FormGroup;

  closeResult: string;

  details: {
    customReply?: string;
    savedReply?: string;
    needRepro?: boolean;
    canBeClosed?: boolean;
    close?: boolean;
  } = {};

  constructor(private modalService: NgbModal, private fb: FormBuilder) {

  }

  getMarkdown() {
    return md;
  }

  open(content) {
    this.buildForm();
    this.modalService.open(content).result.then((result) => {
      console.log('close');
      this.closeResult = `Closed with: ${result}`;
      console.log(this.form.value);
    }, _ => null);
  }

  private buildForm() {
    this.form = this.fb.group({
      customReply: [this.details.customReply],
      savedReply: [this.details.savedReply],
      needRepro: [this.details.needRepro],
      canBeClosed: [this.details.canBeClosed],
      close: [this.details.close],
    });
  }

}