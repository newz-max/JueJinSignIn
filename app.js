// import got from 'got'
// import config from './config.js'
const got = require("got");
// const got = await import('got')
const config = require("./config");
const { cookie, aid, uuid, _signature, PUSH_PLUS_TOKEN } = config;

const BASEURL = "https://api.juejin.cn/growth_api/v1/check_in"; // 掘金签到api
const lotteryUrl = "https://api.juejin.cn/growth_api/v1/lottery/draw"; // 掘金抽奖API
const PUSH_URL = "http://www.pushplus.plus/send"; // pushplus 推送api

const URL = `${BASEURL}?aid=${aid}&uuid=${uuid}&_signature=${_signature}`;
const LURL = `${lotteryUrl}?aid=${aid}&uuid=${uuid}&_signature=${_signature}`;

const HEADERS = {
  cookie,
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.67",
};

/**
* 登录
*/
async function unLogin(content){
 const body = {
   token : PUSH_PLUS_TOKEN,
   title : `掘金登录失效`,
   content : `${content}${new Date().getTime()}`,
 } 
 await got.post(PUSH_URL , {
   json : body
 })
}

// 签到
async function signIn() {
  const res = await got.post(URL, {
    hooks: {
      beforeRequest: [
        (options) => {
          Object.assign(options.headers, HEADERS);
        },
      ],
    },
  });




  if(  JSON.parse(res.body).err_msg.indexOf('已完成签到') !== -1 ) {
    unLogin(res.body)
    return;
  }

  setTimeout(async () => {
    const lottery = await got.post(LURL , {
      headers : HEADERS,
    });

    handlePush(lottery.body);
  }, 1000);
}

// push
async function handlePush(desp) {
  const body = {
    token: `${PUSH_PLUS_TOKEN}`,
    title: `签到结果`,
    content: `别忘了下班打卡哦，${desp}`,
  };
  const res = await got.post(PUSH_URL, {
    json: body,
  });
}

signIn();
