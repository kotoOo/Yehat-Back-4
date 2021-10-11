import{f as e,l as a,D as i,z as t,A as s,o as l,x as o,j as d,q as c,y as r,G as m,E as n,v as u}from"./index.154289d4.js";import{_ as p}from"./stage2.41e6de3a.js";const{Notify:g,copyToClipboard:b,format:f}=Quasar,S={props:{item:Object},setup(e){const a=computed((()=>({background:`url(${e.item.image4.base64}) no-repeat center center / contain`,display:"inline-block"}))),i={en:{useAsMain:"Use as Main",isFeedback:"Is a Feedback photo",upgradeToSliderItem:"Upgrade into a Slide",upgradeSuccessful:"Upgrade Successful!",upgradeFailed:"Upgrade Failed!"},ru:{useAsMain:"Использовать как основное",isFeedback:"Это обратная связь",upgradeToSliderItem:"Апгрейдить в слайд",upgradeSuccessful:"Апгрейд выполнен успешно.",upgradeFailed:"Апгрейд НЕ ВЫПОЛНЕН, ОШИБКА"}},t=computed((()=>i[core.yehat.lang])),s=computed({get:()=>e.item.tags.has("feedback"),set:a=>{a?e.item.tags.add("feedback"):e.item.tags.remove("feedback"),e.item.saveLocal.save()}}),l=computed((()=>!!e.item.shhnSliderItem0)),o=computed((()=>core.yehat.auth.isSuperAdmin));return{imageStyle:a,i:t,isFeedback:s,upgradeToSliderItem:()=>{e.item.shhnSliderItem0?g.create(t.value.upgradeFailed+" (already a slide)"):(e.item.shhnSliderItem0={ru:{caption:"",subcaption:""},en:{caption:"",subcaption:""},lastEventDate:""},e.item.saveLocal.shhnSliderItem0=!0,e.item.saveLocal.save(),g.create(t.value.upgradeSuccessful))},isSlide:l,isSuperAdmin:o,copyBase64:async()=>{await b(e.item.image4.base64);const a=e.item.image4.base64.length;g.create(`${f.humanStorageSize(a)} coppied to you clipboard.`)},copyImage:async()=>{const a=await fetch(e.item.image4.base64).then((e=>e.blob()));navigator.clipboard.write([new ClipboardItem({"image/png":a})])}}}};t("data-v-c7ecc0ec");const v={class:"row no-wrap full-height"},h={class:"col-6"},k={class:"aspect"},y={class:"col"},I={class:"column no-wrap full-height"},F={class:"col"},_={class:"col-auto"},w=m("=> BASE64"),A=m("=> PNG");s();var C=p(S,[["render",function(t,s,p,g,b,f){const S=e("BtnResize0"),C=e("BtnMove0"),B=e("btn0"),M=e("q-space"),T=e("q-btn"),q=e("q-toggle"),U=e("q-toolbar"),j=e("IDialog0");return l(),a(j,{item:p.item,class:"image-4",seamless:!1,"btn-close":"",scroll:!1},{headerButtons:i((()=>[o(S,{item:p.item,dir:"w"},null,8,["item"]),o(S,{item:p.item,dir:"a"},null,8,["item"]),o(S,{item:p.item,dir:"s"},null,8,["item"]),o(S,{item:p.item,dir:"d"},null,8,["item"]),o(C,{item:p.item},null,8,["item"])])),default:i((()=>[d("div",v,[d("div",h,[d("div",k,[d("div",{class:"image fit absolute",style:c(g.imageStyle)},null,4)])]),d("div",y,[d("div",I,[d("div",F,[r(t.$slots,"default",{},void 0,!0)]),d("div",_,[o(U,null,{default:i((()=>[g.isSlide?u("",!0):(l(),a(B,{key:0,tier:"premium",onClick:g.upgradeToSliderItem},{default:i((()=>[m(n(g.i.upgradeToSliderItem),1)])),_:1},8,["onClick"])),o(M),g.isSlide?u("",!0):(l(),a(T,{key:1,flat:"",color:"white",onClick:s[0]||(s[0]=e=>t.$emit("useAsMain"))},{default:i((()=>[m(n(g.i.useAsMain),1)])),_:1})),g.isSlide?u("",!0):(l(),a(q,{key:2,modelValue:g.isFeedback,"onUpdate:modelValue":s[1]||(s[1]=e=>g.isFeedback=e),label:g.i.isFeedback},null,8,["modelValue","label"]))])),_:1}),g.isSuperAdmin?(l(),a(U,{key:0},{default:i((()=>[o(B,{tier:"proto",onClick:g.copyBase64},{default:i((()=>[w])),_:1},8,["onClick"]),o(B,{tier:"proto",onClick:g.copyImage},{default:i((()=>[A])),_:1},8,["onClick"])])),_:1})):u("",!0)])])])])])),_:3},8,["item"])}],["__scopeId","data-v-c7ecc0ec"]]);export{C as default};