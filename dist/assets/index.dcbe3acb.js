import{S as o,P as n,W as t,T as e,M as i,a as s,b as a,A as d,c as r,B as w,d as c,e as p,f as l}from"./vendor.37082f73.js";const m=new o,u=new n(75,window.innerWidth/window.innerHeight,.1,1e3),g=new t({canvas:document.querySelector("#bg")});g.setPixelRatio(window.devicePixelRatio),g.setSize(window.innerWidth,window.innerHeight),u.position.setZ(30),u.position.setX(-3),g.render(m,u);const f=new e(10,3,16,100),y=new i({color:16737095}),x=new s(f,y);m.add(x);const z=new a(16777215);z.position.set(5,5,5);const h=new d(16777215);m.add(z,h),Array(200).fill().forEach((function(){const o=new p(.25,24,24),n=new i({color:16777215}),t=new s(o,n),[e,a,d]=Array(3).fill().map((()=>l.randFloatSpread(100)));t.position.set(e,a,d),m.add(t)}));const b=(new r).load("/dist/assets/space.jpg");m.background=b;const j=(new r).load("/dist/assets/sithu.jpeg"),A=new s(new w(3,3,3),new c({map:j}));m.add(A);const S=(new r).load("/dist/assets/moon.jpg"),v=(new r).load("/dist/assets/normal.jpg"),P=new s(new p(3,32,32),new i({map:S,normalMap:v}));function R(){const o=document.body.getBoundingClientRect().top;P.rotation.x+=.05,P.rotation.y+=.075,P.rotation.z+=.05,A.rotation.y+=.01,A.rotation.z+=.01,u.position.z=-.01*o,u.position.x=-2e-4*o,u.rotation.y=-2e-4*o}m.add(P),P.position.z=30,P.position.setX(-10),A.position.z=-5,A.position.x=2,document.body.onscroll=R,R(),function o(){requestAnimationFrame(o),x.rotation.x+=.01,x.rotation.y+=.005,x.rotation.z+=.01,P.rotation.x+=.005,g.render(m,u)}();
