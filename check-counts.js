const fs = require('fs');
const list = [
  ['index.html', 'crashcoupons'],
  ['crash-coupons.html', 'crash coupons'],
  ['www-crashcoupons.html', 'www crashcoupons'],
  ['crashcoupon.html', 'crashcoupon'],
  ['crash-coupons-com.html', 'crash coupons com'],
  ['www-crashcoupon-con.html', 'www crashcoupon con'],
  ['crashcoupons-com.html', 'crashcoupons com'],
  ['crash-coupon.html', 'crash coupon'],
  ['crashcoupons.com.html', 'crashcoupons.com']
];
list.forEach(([file, kw]) => {
  if (!fs.existsSync(file)) return console.log(file + ' missing');
  const content = fs.readFileSync(file, 'utf8');
  const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const re = new RegExp(escaped, 'gi');
  const count = (content.match(re) || []).length;
  console.log(`${file} -> [${kw}]: ${count}`);
});
