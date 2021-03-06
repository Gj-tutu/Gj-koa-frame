/**
 * Created by gaojun on 17-3-9.
 */
const SMSClient = require('@alicloud/sms-sdk');
const config = require('../../../config');

// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = config.aliyun.access_key;
const secretAccessKey = config.aliyun.access_secret;
const SignName = config.aliyun.sms_sign;
// 初始化sms_client
let smsClient = new SMSClient({ accessKeyId, secretAccessKey });
let sms_mapping = {};
for (let key in config.aliyun.sms_template) {
  sms_mapping[key] = key;
}
export const TEMPLATES = sms_mapping;

export function send(mobile, template, params) {
  let item = config.aliyun.sms_template[template];
  if (!item) return Promise.reject(new Error('sms template is error'));

  let params_mapping = {};
  for (let key in item.params) {
    let value = item.params[key];
    if (!params[key]) return Promise.reject(new Error(`sms params miss: ${key}`));
    params_mapping[value] = params[key];
  }
  console.log(`sms: ${mobile} ${template} -> ${item.template} ${JSON.stringify(params)} (${JSON.stringify(params_mapping)})`);
  return smsClient.sendSMS({
    PhoneNumbers: mobile,
    SignName,
    TemplateCode: template,
    TemplateParam: JSON.stringify(params_mapping),
  }).then((res) => {
    let { Code } = res;
    console.log(res);
    if (Code === 'OK') {
      // 处理返回参数
      return Promise.resolve();
    } else {
      throw new Error(`sms fail: ${Code}`);
    }
  }, (err) => {
    console.log(err);
    throw new Error(`sms fail:${err}`);
  });
}
