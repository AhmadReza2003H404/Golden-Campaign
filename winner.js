let shown = 0;
let isShowing = false;
let showBackGround = true;
let isWinnersFileDownloaded = false;
const stackEl = document.getElementById('stack');
const stage = document.getElementById('stage');
const rightList = document.getElementById('rightList');
const leftList = document.getElementById('leftList');

function foramatPhoneNumber(phoneNumber) {

  const PERS = '۰۱۲۳۴۵۶۷۸۹';
  const ARAB = '٠١٢٣٤٥٦٧٨٩';
  const ASCII = '0123456789';

  // Normalize any Persian/Arabic-Indic digits to ASCII
  const toAscii = s => String(s)
    .replace(/[۰-۹]/g, ch => ASCII[PERS.indexOf(ch)])
    .replace(/[٠-٩]/g, ch => ASCII[ARAB.indexOf(ch)]);

  // 1) Keep digits only; normalize country code to a leading 0
  let digits = toAscii(phoneNumber).replace(/\D+/g, '');
  if (digits.startsWith('0098')) digits = digits.slice(4);
  if (digits.startsWith('98')) digits = digits.slice(2);
  if (digits.length && !digits.startsWith('0')) digits = '0' + digits;

  // 2) Mask 5th, 6th, 7th characters (1-based => indices 4,5,6)
  const arr = digits.split('');
  [4, 5, 6].forEach(i => { if (i < arr.length) arr[i] = '*'; });
  const masked = arr.join('');

  // 3) Convert to Persian digits if available
  return (typeof persianNumbers !== 'undefined')
    ? masked.replace(/\d/g, d => persianNumbers[Number(d)])
    : masked;
}

function converNumberToPersianNumber(id) {
  return String(id).replace(/\d/g, d => persianNumbers[Number(d)]);
}

/* Build a card DOM node */
function createCard(w) {
  const el = document.createElement('div');
  el.className = 'stage';
  el.innerHTML = `<div class="ticket">${converNumberToPersianNumber(w.id)}</div>
     <div class="grid"> 
     <!-- Row 1: Invitee -->
      <div class="phone">${foramatPhoneNumber(w.invitee_username)}</div>
       <div class="info"> <div class="title">
        <span class="title-text">مشخصات دعوت‌شونده</span> 
        <span class="dash" aria-hidden="true"></span>
         </div> <div class="name">${w.invitee_first_name} ${w.invitee_last_name}</div> 
         </div>
          <!-- Row 2: Inviter -->
           <div class="phone">${foramatPhoneNumber(w.inviter_username)}</div> 
           <div class="info"> <div class="title">
            <span class="title-text">مشخصات دعوت‌کننده</span>
             <span class="dash" aria-hidden="true"></span>
              </div> 
              <div class="name">${w.inviter_first_name} ${w.inviter_last_name}
              </div> </div> </div>`; return el;
}

// 3) Build one winner-pill (matches your existing structure/classes)
function createWinnerPill(d) {
  const el = document.createElement('div');
  el.className = 'winner-pill';
  el.innerHTML = `
    <div class="d-flex">
      <div class="code">${converNumberToPersianNumber(d.id)}</div>
        <div class="name">${d.inviter_first_name} ${d.inviter_last_name}</div>
    </div>
    <div class="d-flex">
      <div class="mobile">${foramatPhoneNumber(d.inviter_username)}</div>
      <div class="name">${d.invitee_first_name} ${d.invitee_last_name}</div>
      <div class="mobile">${foramatPhoneNumber(d.invitee_username)}</div>
    </div>
  `;
  return el;
}
function nextWinner() {

  
  if (!isShowing) {
    isShowing = true;
    return;
  }

  if (shown === WINNERS_COUNT) {
    sendWinnerToList(winner, 'left');
    shown++;
    if (typeof hideDiv === 'function') hideDiv('stage');
  } else if (shown < WINNERS_COUNT) {
    
    const index = shown * Math.floor(winners_size / WINNERS_COUNT) + Number(fixedNumber);



    // Advance to the next winner and show their card
    if(showBackGround) {
      shown++;
      winner = winners[index];
      winner.id = index + 1;
      showwedWinners.push(winner);

      const card = createCard(winner);
      stackEl.innerHTML = "";
      stackEl.appendChild(card);
      showBackGround = false;
      showDiv('stage');

    } else {
      showBackGround = true;
          // Move the *previous* winner (already on stage) to a side list
      if (shown > 0) {
        const side = shown < 16 ? 'right' : 'left';
        sendWinnerToList(winner, side);
      }      hideDiv('stage')
    }


    // updateStackVisual();
  } else {
    if(!isWinnersFileDownloaded){
      isWinnersFileDownloaded = true;
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(showwedWinners));
      var dlAnchorElem = document.getElementById('downloadAnchorElem');
      dlAnchorElem.setAttribute("href",     dataStr     );
      dlAnchorElem.setAttribute("download", "winners.json");
      dlAnchorElem.click();
    }
  }
}


function updateStackVisual() {
  // Newest card is the last child; assign visual depths 0..3 (clamped)
  const cards = Array.from(stackEl.children);
  for (let i = cards.length - 1, depth = 0; i >= 0; i--, depth++) {
    const d = Math.min(depth, 3);
    cards[i].setAttribute('data-depth', String(d));
  }
}

/**
 * Animate a visual "fly" from a stage card to a list where a pill will live.
 * Keeps the original card on the stack (so it can slide into the background).
 */
function flyToList(sourceCardEl, destinationListEl, pillEl) {
  // 1) Insert the pill hidden so we can measure its final position
  pillEl.classList.add('winner-pill--hidden');
  destinationListEl.appendChild(pillEl);

  const srcRect = sourceCardEl.getBoundingClientRect();
  const dstRect = pillEl.getBoundingClientRect();

  // 2) Create a flying clone of the card to animate
  const fly = sourceCardEl.cloneNode(true);
  fly.classList.remove('card--enter', 'card--enter-active');
  fly.classList.add('card--fly');

  Object.assign(fly.style, {
    left: `${srcRect.left}px`,
    top: `${srcRect.top}px`,
    width: `${srcRect.width}px`,
    height: `${srcRect.height}px`,
    transform: 'none',
    opacity: '1',
    zIndex: '9999'
  });

  document.body.appendChild(fly);

  // 3) Animate the clone to the pill's position/size
  const dx = dstRect.left - srcRect.left;
  const dy = dstRect.top - srcRect.top;
  const sx = dstRect.width / srcRect.width;
  const sy = dstRect.height / srcRect.height;

  requestAnimationFrame(() => {
    fly.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1), opacity .7s cubic-bezier(.2,.8,.2,1)';
    fly.style.transformOrigin = 'top left';
    fly.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    fly.style.opacity = '.2';
  });

  // 4) On finish: remove the clone and reveal the real pill nicely
  fly.addEventListener('transitionend', () => {
    fly.remove();
    pillEl.classList.remove('winner-pill--hidden');
    // tiny delay to allow visibility change to apply before animating opacity
    requestAnimationFrame(() => pillEl.classList.add('winner-pill--show'));
  }, { once: true });
}

function sendWinnerToList(prevWinnerData, side /* 'right' | 'left' */) {
  const prevTopCard = stackEl.lastElementChild; // current top card on stage
  if (!prevTopCard) return;

  const pill = createWinnerPill(prevWinnerData);
  const targetList = side === 'right' ? rightList : leftList;

  flyToList(prevTopCard, targetList, pill);

  // Push the real card visually to the background stack
  updateStackVisual();
}
