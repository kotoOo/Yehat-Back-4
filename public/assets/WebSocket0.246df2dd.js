import{f as e,l as t,D as o,z as a,A as s,o as i,j as c,C as n,J as l,x as r,G as u,E as d}from"./index.154289d4.js";import{_ as m}from"./stage2.41e6de3a.js";const p={props:{item:Object},setup(e){const t=reactive({unwatches:[]}),o=()=>{e.item.saveLocal.save(),Quasar.Notify.create("Saved Locally.")};onMounted((()=>{t.unwatches.push(watch(e.item.websocketConfig,o,{deep:!0}))})),onBeforeUnmount((()=>{t.unwatches.map((e=>e()))}));const a=computed((()=>"connected"===yehat.ioStatus?"premium":"error"===yehat.ioStatus?"monkeys":"standard")),s=computed((()=>"connected"===yehat.ioStatus?"CONNECTED":"error"===yehat.ioStatus?"ERROR":"CONNECT"));return{yehat:core.yehat,save:o,connect:()=>{core.yehat.connectIO()},buttonTier:a,buttonCaption:s}}};a("data-v-ebc487dc");const v=c("header",{class:"widget-header"},"WebSocket0",-1),h={class:"column no-wrap full-height"},b=c("div",{class:"caption col-auto"},"Standard Yehat Beta I WebSockets Server",-1),w={class:"col scroll"},f={class:"row no-wrap q-col-gutter-x-sm items-center"},C=c("label",{class:"col-auto"},"Host",-1),g={class:"col"},k={class:"row no-wrap q-col-gutter-x-sm items-center"},y=c("label",{class:"col-auto"},"Port",-1),S={class:"col"},x={class:"toolbar col-auto"},_=u("Save"),q={class:"io-status"},B={class:"toolbar row no-wrap q-gutter-x-xs col-auto"};s();var E=m(p,[["render",function(a,s,m,p,E,N){const O=e("btn0"),j=e("q-space"),I=e("BtnResize0"),R=e("BtnMove0"),T=e("IDialog0");return i(),t(T,{item:m.item,itemless:"","btn-close":""},{headerButtons:o((()=>[])),header:o((()=>[v])),default:o((()=>[c("div",h,[b,c("div",w,[c("div",f,[C,c("div",g,[n(c("input",{"onUpdate:modelValue":s[0]||(s[0]=e=>m.item.websocketConfig.host=e),class:"input-dense col"},null,512),[[l,m.item.websocketConfig.host]])])]),c("div",k,[y,c("div",S,[n(c("input",{"onUpdate:modelValue":s[1]||(s[1]=e=>m.item.websocketConfig.port=e),class:"input-dense"},null,512),[[l,m.item.websocketConfig.port,void 0,{number:!0}]])])])]),c("div",x,[r(O,{dense:"",color:"orange-10",size:"10px",onClick:p.save},{default:o((()=>[_])),_:1},8,["onClick"]),r(O,{onClick:p.connect,class:"q-ml-xs",tier:p.buttonTier},{default:o((()=>[u(d(p.buttonCaption),1)])),_:1},8,["onClick","tier"]),r(j),c("div",q,d(p.yehat.ioStatus),1)]),c("div",B,[r(j),r(I,{item:m.item,dir:"w"},null,8,["item"]),r(I,{item:m.item,dir:"a"},null,8,["item"]),r(I,{item:m.item,dir:"s"},null,8,["item"]),r(I,{item:m.item,dir:"d"},null,8,["item"]),r(R,{item:m.item},null,8,["item"])])])])),_:1},8,["item"])}],["__scopeId","data-v-ebc487dc"]]);export{E as default};
