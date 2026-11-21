const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

const menu = [
  {id:'avocado-toast',name:'Green Goddess Toast',category:'Breakfast',description:'Smashed avocado, whipped feta, chili crunch.',price:12.5,rating:'4.9',badge:'Local favorite',image:'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=720&q=82'},
  {id:'burrata-salad',name:'Sunny Burrata Salad',category:'Salads',description:'Heirloom tomatoes, basil, a little sunshine.',price:15,rating:'4.8',badge:'Fresh pick',image:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=720&q=82'},
  {id:'crispy-chicken',name:'Crispy Chicken Sando',category:'Mains',description:'Buttermilk chicken, slaw, house pickles.',price:16.5,rating:'4.9',badge:'Bestseller',image:'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=720&q=82'},
  {id:'spicy-noodles',name:'Chili Sesame Noodles',category:'Mains',description:'Springy noodles, sesame, crunchy chili oil.',price:14,rating:'4.7',badge:'A little kick',image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=720&q=82'},
  {id:'berry-pancakes',name:'Berry Cloud Pancakes',category:'Breakfast',description:'Fluffy stacks, berries, maple butter.',price:13,rating:'4.8',badge:'Brunch mood',image:'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=720&q=82'},
  {id:'market-bowl',name:'Market Day Grain Bowl',category:'Salads',description:'Roasted veg, greens, herby tahini.',price:14.5,rating:'4.9',badge:'Plant powered',image:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=720&q=82'},
  {id:'tomato-pasta',name:'Sunday Tomato Pasta',category:'Mains',description:'Slow-simmered tomato, parmesan, basil.',price:17,rating:'4.8',badge:'Comfort food',image:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=720&q=82'},
  {id:'choco-cookie',name:'Big Soft Choc Chip',category:'Desserts',description:'Golden edges, gooey middle, sea salt.',price:5.5,rating:'5.0',badge:'Sweet treat',image:'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=720&q=82'},
  {id:'lemonade',name:'Fresh Squeezed Lemonade',category:'Drinks',description:'Real lemons, a hint of mint, lots of ice.',price:4.5,rating:'4.9',badge:'Made today',image:'https://images.unsplash.com/photo-1513558161293-cdab765edfd7?auto=format&fit=crop&w=720&q=82'},
  {id:'berry-cheesecake',name:'Berry Cheesecake Cup',category:'Desserts',description:'Creamy vanilla cheesecake, bright berry compote.',price:7,rating:'4.8',badge:'Sweet treat',image:'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=720&q=82'}
];

app.use(express.json({limit:'32kb'}));
app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');next();});
app.use(express.static(__dirname,{extensions:['html']}));

function ensureDataDir(){fs.mkdirSync(DATA_DIR,{recursive:true});if(!fs.existsSync(ORDERS_FILE))fs.writeFileSync(ORDERS_FILE,'[]','utf8');}
function readOrders(){ensureDataDir();try{return JSON.parse(fs.readFileSync(ORDERS_FILE,'utf8'))}catch{return []}}
function writeOrders(orders){ensureDataDir();const temporary=`${ORDERS_FILE}.${process.pid}.tmp`;fs.writeFileSync(temporary,JSON.stringify(orders,null,2),'utf8');fs.renameSync(temporary,ORDERS_FILE)}
function roundCurrency(value){return Math.round((value+Number.EPSILON)*100)/100}

app.get('/api/health',(req,res)=>res.json({status:'ok',service:'Eat & Smile',timestamp:new Date().toISOString()}));
app.get('/api/menu',(req,res)=>{const category=typeof req.query.category==='string'?req.query.category.trim():'';const search=typeof req.query.search==='string'?req.query.search.trim().toLowerCase():'';const filtered=menu.filter(item=>(!category||category==='All'||item.category.toLowerCase===category.toLower) ).filter(item=>!search||`${item.name} ${item.description} ${item.category}`.toLowerCase().includes(search));res.json({items:filtered,categories:['All','Breakfast','Mains','Salads','Desserts','Drinks']});});
app.get('/api/menu/:id',(req,res)=>{const item=menu.find(dish=>dish.id===req.params.id);if(!item)return res.status(404).json({error:'Menu item not found'});res.json(item);});

app.post('/api/orders',(req,res)=>{const {address,items,customerName}=req.body||{};if(typeof address!=='string'||address.trim().length<5)return res.status(400).json({error:'A valid delivery address is required'});if(!Array.isArray(items)||items.length===0)return res.status(400).json({error:'The cart is empty'});if(items.length>50)return res.status(400).json({error:'Too many cart items'});
  const normalized=[];for(const entry of items){if(!entry||typeof entry.id!=='string'||!Number.isInteger(entry.quantity)||entry.quantity<1||entry.quantity>20)return res.status(400).json({error:'Invalid cart item'});const dish=menu.find(item=>item.id===entry.id);if(!dish)return res.status(400).json({error:`Unknown menu item: ${entry.id}`});normalized.push({id:dish.id,name:dish.name,quantity:entry.quantity,unitPrice:dish.price,lineTotal:roundCurrency(dish.price*entry.quantity)});} 
  const subtotal=roundCurrency(normalized.reduce((sum,item)=>sum+item.lineTotal,0));const delivery=subtotal>=25?0:2.99;const tax=roundCurrency(subtotal*0.08);const total=roundCurrency(subtotal+delivery+tax);const orders=readOrders();const order={id:`ES-${Date.now().toString(36).toUpperOf()}`.replace(/[^A-Za-z0-9-]/g,''),createdAt:new Date().toISOString(),status:'confirmed',customerName:typeof customerName==='string'?customerName.trim().slice(0,80):null,address:address.trim().slice(0,300),items:normalized,subtotal,delivery,tax,total};orders.push(order);writeOrders(orders);res.status(201).json(order);
});
app.get('/api/orders',(req,res)=>res.json(readOrders()));
app.get('/api/orders/:id',(req,res)=>{const order=readOrders().find(item=>item.id===req.params.id);if(!order)return res.status(404).json({error:'Order not found'});res.json(order);});

app.use((req,res)=>res.status(404).json({error:'Endpoint not found'}));
app.use((error,req,res,next)=>{console.error(error);res.status(500).json({error:'Internal server error'});});

if(require.main===module){ensureDataDir();app.listen(PORT,()=>console.log(`Eat & Smile server listening on http://localhost:${PORT}`));}
module.exports={app,menu};
