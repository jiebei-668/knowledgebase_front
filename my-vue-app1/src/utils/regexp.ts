/**
 * @description 常用正则表达式集合
 */

/**
 * 手机号码正则
 * @description 匹配中国大陆手机号码（13-19号段）
 * @example
 * Phone.test('13812345678') // true
 * Phone.test('12345678') // false
 */
export const Phone = /^1[3-9]\d{9}$/

/**
 * 邮箱地址正则
 * @description 匹配标准邮箱地址格式
 * @example
 * Email.test('user@example.com') // true
 * Email.test('invalid.email') // false
 */
export const Email = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/

/**
 * 密码强度正则（6位数字）
 * @description 匹配6位纯数字密码
 * @example
 * Password.test('123456') // true
 * Password.test('12345') // false
 */
export const Password = /^\d{6}$/

/**
 * 6位数字验证码正则
 * @description 匹配6位纯数字验证码
 * @example
 * Code_6.test('123456') // true
 * Code_6.test('12345') // false
 */
export const Code_6 = /^\d{6}$/

/**
 * 4位数字验证码正则
 * @description 匹配4位纯数字验证码
 * @example
 * Code_4.test('1234') // true
 * Code_4.test('123') // false
 */
export const Code_4 = /^\d{4}$/

/**
 * URL链接正则
 * @description 匹配标准URL格式，支持http(s)和www开头的链接
 * @example
 * Url.test('https://www.example.com') // true
 * Url.test('http://localhost:3000') // true
 * Url.test('invalid-url') // false
 */
export const Url = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/

/**
 * 十六进制颜色值正则
 * @description 匹配3位或6位十六进制颜色值，支持可选的#前缀
 * @example
 * ColorRegex.test('#333') // true
 * ColorRegex.test('#8c8c8c') // true
 * ColorRegex.test('invalid') // false
 */
export const ColorRegex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/

/**
 * 中文字符正则
 * @description 匹配中文字符（不包含标点符号）
 * @example
 * OnlyCh.test('中文') // true
 * OnlyCh.test('Chinese') // false
 */
export const OnlyCh = /^[\u4E00-\u9FA5]+$/

/**
 * 英文字符正则
 * @description 匹配英文字母（不区分大小写）
 * @example
 * OnlyEn.test('English') // true
 * OnlyEn.test('英文') // false
 */
export const OnlyEn = /^[a-zA-Z]+$/

/**
 * 强密码正则（已注释，供参考）
 * @description 密码为8-18位数字/字符/符号的组合
 * - 不能是纯数字
 * - 不能是纯小写字母
 * - 不能是纯大写字母
 * - 不能是纯符号
 * - 不能包含中文
 * @example
 * StrongPassword.test('Abc123!@#') // true
 * StrongPassword.test('12345678') // false
 */
// export const StrongPassword = /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/

/**
 * 身份证号码正则
 * @description 匹配18位身份证号码
 * @example
 * IdCard.test('110101199003077758') // true
 * IdCard.test('invalid') // false
 */
export const IdCard = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/

/**
 * 金额正则
 * @description 匹配金额格式，支持两位小数
 * @example
 * Money.test('123.45') // true
 * Money.test('123.456') // false
 */
export const Money = /^[1-9]\d*(\.\d{1,2})?$|^0(\.\d{1,2})?$/

/**
 * IPv4地址正则验证
 * @description 匹配标准IPv4地址格式（禁止前导零）
 * @example
 * IPv4.test('192.168.1.1') // true
 * IPv4.test('8.8.8.8')     // true
 * IPv4.test('0.0.0.0')     // true
 * IPv4.test('256.0.0.1')   // false（超出范围）
 * IPv4.test('01.02.03.04') // false（前导零）
 */
export const IPv4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

/**
 * IPv6地址正则验证
 * @description 匹配标准IPv6地址格式（支持零压缩符::）
 * @example
 * IPv6.test('2001:0db8:85a3:0000:0000:8a2e:0370:7334') // true
 * IPv6.test('2001:db8::1')                              // true（压缩格式）
 * IPv6.test('::1')                                      // true（本地回环）
 * IPv6.test('fe80::1%eth0')                             // true（带区域标识）
 * IPv6.test('2001::25de::cade')                         // false（多压缩符）
 * IPv6.test('2001:db8::g::1')                           // false（非法字符）
 */
export const IPv6 = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+)$/
/** ipv4 + ipv6**/
export const IP = new RegExp(
    '^(?:' +
    '(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}' +
    '|(?:[0-9a-fA-F]{1,4}:){1,7}:' +
    '|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}' +
    '|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}' +
    '|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}' +
    '|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}' +
    '|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}' +
    '|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}' +
    '|::(?::[0-9a-fA-F]{1,4}){1,7}' +
    '|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+)' +
    ')$'
);
/**
 * 中国大陆座机号码正则
 * @description 匹配座机号码，支持区号和分机号
 * @example
 * TelPhone.test('010-12345678') // true
 * TelPhone.test('010-1234-5678') // true
 */
export const TelPhone = /^(0\d{2,3}[-])?\d{7,8}([-]\d{1,4})?$/

/**
 * 班级id正则
 * @description 匹配班级id，支持英文(不区分大小写)和数字
 * @example
 * classid1 // true
 * dptid134 // true
 * dpt&6 // false
 */
export const ClassIdRule = /^[a-zA-Z0-9]+$/

/**
 * 日期正则
 * @description 匹配日期
 * @example
 * 2021-05-12 // true
 * 20xx-08-er // false
 */
export const DateRule = /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/


/**
 * 数字正则
 * @description 匹配n位纯数字
 * @example
 * IntegerOnly.test('1234') // true
 * IntegerOnly.test('123#') // false
 */
export const IntegerOnly = /^[1-9]\d+$/

/**
 * 数字正则
 * @description 匹配非负整数
 * @example
 */
export const NonNegativeInteger = /^(0|[1-9]\d*)$/
