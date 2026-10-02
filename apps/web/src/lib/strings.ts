import type { Direction } from '@pantho075/matra';

export const S = {
  appName: 'লেখো',
  tagline: 'বাংলা বর্ণ লিখতে শেখো — স্ট্রোক ধরে ধরে',
  vowels: 'স্বরবর্ণ',
  consonants: 'ব্যঞ্জনবর্ণ',
  digits: 'সংখ্যা',
  done: 'শেখা হয়েছে',
  next: 'এগিয়ে যাও',
  replay: 'আবার দেখাও',
  showStroke: 'এই স্ট্রোকটি দেখাও',
  hideNumbers: 'নম্বর লুকাও',
  showNumbers: 'নম্বর দেখাও',
  stroke: 'স্ট্রোক',
  strokes: 'টি স্ট্রোক',
  check: 'যাচাই করো',
  reset: 'রিসেট',
  nice: 'বাহ!',
  awesome: 'দারুণ! 🎉',
  wrongOrder: 'স্ট্রোকের ক্রম ঠিক হয়নি — রিসেট চেপে আবার চেষ্টা করো।',
  tryAgain: 'আবার চেষ্টা করো',
  finishStep: 'এগোতে হলে ধাপটি শেষ করো।',
  nextLetter: 'পরের বর্ণ',
  backToList: 'তালিকায় ফেরো',
  completed: 'সম্পন্ন!',
  completedBody: (ch: string) => `তুমি ${ch} লিখতে শিখে গেছো।`,
  steps: {
    watch: { title: (ch: string) => `${ch} কীভাবে লেখা হয় দেখো`, sub: 'স্ট্রোকগুলো দেখো, তারপর এগিয়ে যাও।', foot: 'স্ট্রোকগুলো দেখো, তারপর এগিয়ে যাও।' },
    traceNum: { title: 'ট্রেস করো — নম্বর অনুসরণ করো', sub: 'গাইডের উপর দিয়ে প্রতিটি স্ট্রোক ক্রম অনুযায়ী আঁকো।', foot: 'লাল স্ট্রোকটি আঁকো।' },
    traceNoNum: { title: 'ট্রেস করো — এবার নম্বর নেই', sub: 'গাইডের উপর দিয়ে প্রতিটি স্ট্রোক ক্রম অনুযায়ী আঁকো।', foot: 'লাল স্ট্রোকটি আঁকো।' },
    parts: { title: (ch: string) => `${ch} তার অংশ দিয়ে গড়ো`, sub: 'স্ট্রোকের ক্রমে অংশগুলোতে ট্যাপ করো — সেগুলো মিলে বর্ণটি তৈরি হবে।', foot: 'এগোতে হলে ধাপটি শেষ করো।' },
    memory: { title: 'মনে করে লেখো', sub: 'কোনো গাইড নেই — মনে করে পুরো বর্ণটি লেখো।', foot: 'ক্রম অনুযায়ী স্ট্রোকগুলো আঁকো।' },
  },
  info: { name: 'নাম', roman: 'উচ্চারণ', strokeCount: 'স্ট্রোক' },
};

export const DIRECTION: Record<Direction, string> = {
  right: '→ ডান দিকে', left: '← বাম দিকে', down: '↓ নিচের দিকে', up: '↑ উপরের দিকে',
  'down-right': '↘ নিচে-ডানে', 'down-left': '↙ নিচে-বামে', 'up-right': '↗ উপরে-ডানে', 'up-left': '↖ উপরে-বামে',
  clockwise: '↻ ঘড়ির কাঁটার দিকে', anticlockwise: '↺ ঘড়ির কাঁটার উল্টো দিকে',
};

export const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const bn = (n: number) => String(n).replace(/\d/g, (d) => BN_DIGITS[+d]);
