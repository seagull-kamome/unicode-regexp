

import * as FS from 'fs';
import * as readline from 'readline';

var curr_code: string|null = null;
var curr_langs = {
  ja: false,
  cn: false,
  tw: false,
  other: false
};

let ja_only = new Array<number>();
let cn_only = new Array<number>();
let tw_only = new Array<number>();
let non_ja = new Array<number>();


const on_keybreak = () => {
  const x = parseInt(curr_code.match(/U\+(.*)/)[1], 16);

  if (curr_langs.ja) {
    if (!curr_langs.cn && !curr_langs.tw && !curr_langs.other)
      ja_only.push(x);
  } else {
    non_ja.push(x);

    if (curr_langs.cn) {
      if (!curr_langs.tw && !curr_langs.other)
        cn_only.push(x);
    } else if (curr_langs.tw) {
      if (!curr_langs.other)
        tw_only.push(x);
    }
  }

  curr_langs = { ja:false, cn:false, tw:false, other:false };
};


const build_regexp = (xs: Array<number>) => {
  var j = 0;
  var regexp: string = '[\\u{' + xs[j].toString(16) + '}';
  for (var i: number = 0; i < xs.length; ++i) {
    if (i == xs.length - 1 || xs[i + 1] != xs[i] + 1) {
      if (i > j) {
        if (i - 1 > j) regexp += '-'
        regexp += '\\u{' + xs[i].toString(16) + '}';
      }
      if (i < xs.length - 1) {
        regexp += '\\u{' + xs[i + 1].toString(16) + '}';
        j = i + 1;
      }
    }
  }

  /*
  var j = 0;
  var regexp: string = '[' + String.fromCodePoint(xs[j]);
  for (var i: number = 0; i < xs.length; ++i) {
    if (i == xs.length - 1 || xs[i + 1] != xs[i] + 1) {
      if (i > j) {
        if (i - 1 > j) regexp += '-'
        regexp += String.fromCodePoint(xs[i]);
      }
      if (i < xs.length - 1) {
        regexp += String.fromCodePoint(xs[i + 1]);
        j = i + 1;
      }
    }
  }
   */
  console.log(regexp + ']');
}



readline.createInterface({
  input: FS.createReadStream(
    'contributed/Unihan_Readings.txt'
    , { encoding: 'utf-8' }) })
  .on('line', (x: string) => {
    const xs = x.split('\t');
    if (xs.length >= 3) {

      if (curr_code !== null && curr_code !== xs[0])
        on_keybreak();

      curr_code = xs[0];
      switch (xs[1]) {
        case 'kJapaneseKun': case 'kJapaneseOn':
          curr_langs.ja = true; break;
        case 'kCantonese': curr_langs.tw = true; break;
        case 'kMandarin':  curr_langs.cn = true; break;
        default: curr_langs.other = true;
      }

      // kCantonese
      // kDefinition
      // kHangul
      // kHanyuPinlu
      // kHanyuPinyin
      // kJapaneseKun
      // kJapaneseOn
      // kKorean
      // kMandarin
      // kTang
      // kTGHZ2013
      // kVietnamese
      // kXHC1983
    } })
  .on('close', () => {
    if (curr_code !== null)
      on_keybreak();

    build_regexp(ja_only);
    build_regexp(cn_only);
    build_regexp(tw_only);
    build_regexp(non_ja);
    //console.log(ja_only);
    //console.log(cn_only);
    //console.log(tw_only);
    //console.log(non_ja);
  });

