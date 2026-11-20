const dishes = [
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
const categories=['All','Breakfast','Mains','Salads','Desserts','Drinks'];
const grid=document.querySelector('#menu-grid');
const categoriesEl=document.querySelector('#category-list');
const searchInput=document.querySelector('#menu-search');
const cartPanel=document.querySelector('#cart-panel');
const backdrop=document.querySelector('#dialog-backdrop');
const cartItemsEl=document.querySelector('#cart-items');
const toastEl=document.querySelector('#toast');
let activeCategory='All';
let cart=loadCart();
let toastTimer;
let lastFocused=null;

function loadCart(){try{const saved=JSON.parse(localStorage.getItem('eat-smile-cart')||'{}');return saved&&typeof saved==='object'?saved:{}}catch{return {}}}
function saveCart(){try{localStorage.setItem('eat-smile-cart',JSON.stringify(cart))}catch{/* Storage may be unavailable; cart remains usable for this visit. */}}
function money(value){return `$${value.toFixed(2)}`}
function renderCategories(){categoriesEl.innerHTML=categories.map(category=>`<button class="category-button" type="button" data-category="${category}" aria-pressed="${activeCategory===category}">${category==='All'?'✦ ':''}${category}</button>`).join('')}
function renderDishes(){const query=searchInput.value.trim().toLowerCase();const filtered=dishes.filter(dish=>(activeCategory==='All'||dish.category===activeCategory)&&(!query||`${dish.name} ${dish.description} ${dish.category}`.toLowerCase().includes(query)));grid.innerHTML=filtered.map(dish=>`<article class="food-card"><div class="food-photo" role="img" aria-label="${dish.name}" style="background-image:url('${dish.image}')"><span class="food-badge">${dish.badge}</span></div><div class="food-card-body"><div class="food-title-row"><h4>${dish.name}</h4><span class="rating" aria-label="Rated ${dish.rating} out of 5">★ ${dish.rating}</span></div><p class="food-description">${dish.description}</p><div class="food-meta"><span class="food-price">${money(dish.price)}</span><button class="add-button" type="button" data-add="${dish.id}" aria-label="Add ${dish.name} to cart">+</button></div></div></article>`).join('');document.querySelector('#empty-results').hidden=filtered.length>0;document.querySelector('#result-count').textContent=`${filtered.length} ${filtered.length===1?'dish':'dishes'}`;document.querySelector('#results-title').textContent=query||activeCategory!=='All'?'Your matches':'Popular near you'}
function cartCount(){return Object.values(cart).reduce((sum,count)=>sum+count,0)}
function renderCart(){const entries=dishes.filter(dish=>cart[dish.id]>0);const count=cartCount();document.querySelector('#cart-count').textContent=count;document.querySelector('#open-cart').setAttribute('aria-label',`Open shopping cart, ${count} ${count===1?'item':'items'}`);document.querySelector('#panel-cart-count').textContent=count?`(${count})`:'';document.querySelector('#cart-empty').hidden=entries.length>0;document.querySelector('#cart-footer').hidden=entries.length===0;cartItemsEl.innerHTML=entries.map(dish=>`<article class="cart-line"><div class="cart-thumb" aria-hidden="true" style="background-image:url('${dish.image}')"></div><div><h3>${dish.name}</h3><div class="cart-line-price">${money(dish.price)} each</div><div class="quantity-control"><button type="button" data-change="${dish.id}" data-delta="-1" aria-label="Remove one ${dish.name}">−</button><span>${cart[dish.id]}</span><button type="button" data-change="${dish.id}" data-delta="1" aria-label="Add one ${dish.name}">+</button></div></div><span class="line-total">${money(dish.price*cart[dish.id])}</span></article>`).join('');const total=entries.reduce((sum,dish)=>sum+dish.price*cart[dish.id],0);document.querySelector('#cart-subtotal').textContent=money(total)}
function updateCart(id,delta){cart[id]=Math.max(0,(cart[id]||0)+delta);if(!cart[id])delete cart[id];saveCart();renderCart()}
function showToast(message){toastEl.textContent=message;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2800)}
function openCart(){lastFocused=document.activeElement;cartPanel.hidden=false;cartPanel.setAttribute('aria-hidden','false');backdrop.hidden=false;document.body.style.overflow='hidden';document.querySelector('#close-cart').focus()}
function closeCart(){cartPanel.hidden=true;cartPanel.setAttribute('aria-hidden','true');backdrop.hidden=true;document.body.style.overflow='';if(lastFocused?.focus)lastFocused.focus()}

renderCategories();renderDishes();renderCart();document.querySelector('#year').textContent=new Date().getFullYear();
categoriesEl.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;renderCategories();renderDishes()});
searchInput.addEventListener('input',renderDishes);
grid.addEventListener('click',event=>{const button=event.target.closest('[data-add]');if(!button)return;updateCart(button.dataset.add,1);const dish=dishes.find(item=>item.id===button.dataset.add);showToast(`${dish.name} added to your cart`) });
document.querySelector('#open-cart').addEventListener('click',openCart);document.querySelector('#close-cart').addEventListener('click',closeCart);backdrop.addEventListener('click',closeCart);
cartItemsEl.addEventListener('click',event=>{const button=event.target.closest('[data-change]');if(button)updateCart(button.dataset.change,Number(button.dataset.delta))});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!cartPanel.hidden)closeCart()});
document.querySelector('#checkout-button').addEventListener('click',()=>{showToast('Demo only — connect a checkout service to place real orders.');closeCart()});
const addressDialog=document.querySelector('#address-dialog');const addressInput=document.querySelector('#address-input');
document.querySelector('#address-button').addEventListener('click',()=>{addressInput.value=document.querySelector('#current-address').textContent==='Add your address'?'':document.querySelector('#current-address').textContent;addressDialog.showModal();addressInput.focus()});
document.querySelector('#address-form').addEventListener('submit',event=>{if(event.submitter?.value==='cancel')return;event.preventDefault();const address=addressInput.value.trim();if(!address){addressInput.focus();return}document.querySelector('#current-address').textContent=address;try{localStorage.setItem('eat-smile-address',address)}catch{}addressDialog.close();showToast('Delivery address saved')});
try{const savedAddress=localStorage.getItem('eat-smile-address');if(savedAddress)document.querySelector('#current-address').textContent=savedAddress}catch{}
