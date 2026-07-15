const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;
const villageBackground = new Image();
let villageBackgroundReady = false;
villageBackground.addEventListener('load', () => { villageBackgroundReady = true; });
villageBackground.src = 'assets/starlight-village-3d.png';
const dialogue = document.querySelector('#dialogue');
const objective = document.querySelector('#objective');
const coinBalance = document.querySelector('#coin-balance');
const healthValue = document.querySelector('#health-value');
const attackValue = document.querySelector('#attack-value');
const defenseValue = document.querySelector('#defense-value');
const damageReduction = document.querySelector('#damage-reduction');
const levelValue = document.querySelector('#level-value');
const experienceValue = document.querySelector('#experience-value');
const saveButton = document.querySelector('#save-button');
const autoButton = document.querySelector('#auto-button');
const autoDiceButton = document.querySelector('#auto-dice-button');
const rebirthButton = document.querySelector('#rebirth-button');
const rebirthInfo = document.querySelector('#rebirth-info');
const devicePicker = document.querySelector('#device-picker');
const deviceButtons = document.querySelectorAll('[data-device]');
const mobileMoveButtons = document.querySelectorAll('[data-move]');
const mobileActionButtons = document.querySelectorAll('[data-action]');
const skillButton = document.querySelector('#skill-button');
const skillPanel = document.querySelector('#skill-panel');
const skillClose = document.querySelector('#skill-close');
const skillPointsLabel = document.querySelector('#skill-points');
const skillPanelPoints = document.querySelector('#skill-panel-points');
const skillNodes = document.querySelectorAll('.skill-node');
const shopPanel = document.querySelector('#shop-panel');
const shopClose = document.querySelector('#shop-close');
const capacityBuy = document.querySelector('#capacity-buy');
const capacityPrice = document.querySelector('#capacity-price');
const shopCapacity = document.querySelector('#shop-capacity');
const companionBuy = document.querySelector('#companion-buy');
const cosmeticButtons = document.querySelectorAll('[data-cosmetic]');
const inventoryLabel = document.querySelector('#inventory');
const inventoryButton = document.querySelector('#inventory-button');
const inventoryPanel = document.querySelector('#inventory-panel');
const inventoryClose = document.querySelector('#inventory-close');
const bestEquipButton = document.querySelector('#best-equip');
const weaponList = document.querySelector('#weapon-list');
const armorList = document.querySelector('#armor-list');
const weaponCount = document.querySelector('#weapon-count');
const armorCount = document.querySelector('#armor-count');
const companionList = document.querySelector('#companion-list');
const companionCount = document.querySelector('#companion-count');
const equippedWeapon = document.querySelector('#equipped-weapon');
const equippedArmor = document.querySelector('#equipped-armor');
const equippedCompanion = document.querySelector('#equipped-companion');
const synthesisButtons = document.querySelectorAll('[data-synthesize]');
const sellNormalButton = document.querySelector('#sell-normal');

const TILE = 32;
const COLS = 25;
const ROWS = 18;
const SAVE_KEY = 'starlight-village-save-v1';

// 0: 잔디, 1: 나무, 2: 물, 3: 길, 4: 집, 5: 꽃
const map = [
  '1111111111111111111111111',
  '1000000000000000000000001',
  '1005000000000000000050001',
  '1000110000444000000000001',
  '1000000000444000000110001',
  '1000000000444000050000001',
  '1003333333333333333330001',
  '1003000000000000000030001',
  '1003000111000000110030001',
  '1003000000000000000030001',
  '1003000050000050000030001',
  '1003333333333333333330001',
  '1000000000000000000000001',
  '1000000110000000000110001',
  '1005000000000000000005001',
  '1000000000000000000000001',
  '1000000000000000000000001',
  '1111111111111111111111111',
];

const player = { x: 11 * TILE + 5, y: 12 * TILE + 4, size: 22, speed: 155, direction: 'down' };
const start = { x: player.x, y: player.y };
const npc = { x: 315, y: 232, size: 22, name: '루나' };
const portal = { x: 688, y: 146, size: 54 };
const dungeonExit = { x: 2 * TILE + 4, y: 8 * TILE + 2, size: 45 };
const shopDoor = { x: 214, y: 180 };
const fountain = { x: 148, y: 378 };
const villageObstacles = [
  // 집 윗부분만 막아 문, 분수, 포탈 앞은 항상 접근 가능하게 둡니다.
  { x: 70, y: 68, width: 230, height: 92 },
];
const coinDrops = [
  { x: 8 * TILE + 10, y: 3 * TILE + 11, value: 5, taken: false },
  { x: 8 * TILE + 9, y: 11 * TILE + 10, value: 10, taken: false },
  { x: 17 * TILE + 10, y: 5 * TILE + 10, value: 5, taken: false },
  { x: 22 * TILE + 9, y: 13 * TILE + 10, value: 10, taken: false },
  { x: 3 * TILE + 9, y: 15 * TILE + 10, value: 5, taken: false },
];
const keys = new Set();
let lastTime = 0;
let greeted = false;
let foundPortal = false;
let rolling = false;
let rollFrame = 0;
let coins = 0;
let inDungeon = false;
let autoBattle = false;
let autoDice = false;
let nextAutoDiceAt = 0;
let shopPrice = 500;
let attackCooldown = 0;
let meleeEffect = null;
let lastFountainHeal = 0;
let companionAttackCooldown = 0;
let companionEffect = null;
let companionSkillCooldown = 0;
let companionShieldUntil = 0;
let companionSkillEffect = null;
const rebirth = { count: 0, coinMultiplier: 1, luckMultiplier: 1 };
const cosmetics = { hair: '#4b332a', cloak: '#243b68', charm: 'star' };
const ownedCosmetics = new Set(['base', 'charm-star']);
const cosmeticOptions = {
  'hair-rose': { type: 'hair', value: '#9a4d65' }, 'hair-silver': { type: 'hair', value: '#d1d9ec' },
  'cloak-forest': { type: 'cloak', value: '#2c725d' }, 'cloak-crimson': { type: 'cloak', value: '#a44850' },
  'charm-star': { type: 'charm', value: 'star' }, 'charm-flower': { type: 'charm', value: 'flower' },
};
const projectiles = [];
const playerStats = { health: 100, maxHealth: 100, baseAttack: 10, baseDefense: 5, attack: 10, defense: 5 };
const playerLevel = { level: 1, experience: 0, nextExperience: 100 };
const quest = { stage: 'none', requiredCoins: 20, secondStage: 'none', monsterKills: 0, requiredKills: 3, thirdStage: 'none', sellCount: 0, requiredSells: 3, fourthStage: 'none', synthesisCount: 0, requiredSynthesis: 2 };
const skills = { points: 0, levels: { strength: 0, guard: 0, vitality: 0 }, bonusAttack: 0, bonusDefense: 0, bonusHealth: 0 };
const inventory = { weapon: 0, armor: 0, companion: 0, max: 5, items: { weapon: [], armor: [], companion: [] }, equipped: { weapon: null, armor: null, companion: null } };
const equipment = {
  weapon: ['별빛 검', '바람 활', '루비 지팡이', '달빛 단검', '번개 창', '태양 대검', '서리 활', '수정 지팡이', '그림자 단검', '용의 창', '천둥 도끼', '유성 해머', '심연의 낫', '빛의 세검', '폭풍 채찍'],
  armor: ['숲의 갑옷', '달빛 망토', '수호 방패', '구름 장화', '별빛 투구', '강철 갑옷', '불꽃 망토', '기사 방패', '질풍 장화', '용비늘 투구', '태양 갑주', '겨울 망토', '심해 방패', '성운 장화', '황혼 투구'],
};
const equipmentPower = { weapon: [3, 5, 7, 9, 12, 15, 17, 19, 21, 24, 27, 30, 33, 36, 40], armor: [2, 3, 4, 5, 7, 9, 11, 13, 15, 18, 21, 23, 26, 29, 33] };
const tiers = {
  normal: { label: '일반', color: '#b9c3c9', bonus: 0, rank: 0, chance: .55 },
  rare: { label: '레어', color: '#63c8ff', bonus: 3, rank: 1, chance: .28 },
  epic: { label: '에픽', color: '#cb76ff', bonus: 7, rank: 2, chance: .13 },
  legendary: { label: '전설', color: '#ffd35f', bonus: 14, rank: 3, chance: .025 },
  mythic: { label: '신화', color: '#ff76c8', bonus: 25, rank: 4, chance: .0035 },
  ancient: { label: '고대', color: '#ff914d', bonus: 42, rank: 5, chance: .001 },
  divine: { label: '신성', color: '#a9f8ff', bonus: 66, rank: 6, chance: .00035 },
  transcendent: { label: '초월', color: '#6dffc0', bonus: 98, rank: 7, chance: .0001 },
  absolute: { label: '절대', color: '#fff2a6', bonus: 140, rank: 8, chance: .00003 },
};
const companionPool = ['구름 고양이', '불꽃 여우', '달빛 토끼', '꼬마 드래곤', '수정 요정', '별빛 강아지', '번개 다람쥐', '바다 거북', '꽃 정령', '미니 골렘'];
const companionSkills = {
  '구름 고양이': { name: '구름 치유', cooldown: 5000, color: '#bcefff', description: '체력 18 회복' },
  '불꽃 여우': { name: '화염 구슬', cooldown: 4200, color: '#ff9c61', description: '강한 화염 피해' },
  '달빛 토끼': { name: '달빛 보호막', cooldown: 6000, color: '#d9b5ff', description: '4초간 피해 감소' },
  '꼬마 드래곤': { name: '용의 숨결', cooldown: 6500, color: '#76dfba', description: '주변 적 범위 피해' },
  '수정 요정': { name: '수정 광선', cooldown: 4500, color: '#8eeaff', description: '마법 피해' },
  '별빛 강아지': { name: '별빛 돌진', cooldown: 5000, color: '#ffe188', description: '치명적인 강타' },
  '번개 다람쥐': { name: '번개 사슬', cooldown: 4800, color: '#d9e979', description: '연쇄 번개 피해' },
  '바다 거북': { name: '파도 방벽', cooldown: 6500, color: '#73cdec', description: '강화 보호막' },
  '꽃 정령': { name: '꽃비', cooldown: 5200, color: '#ff9fca', description: '체력 회복' },
  '미니 골렘': { name: '지진 펀치', cooldown: 6000, color: '#c7a37b', description: '범위 피해' },
};

function getCompanionSkill(name) {
  return companionSkills[name] ?? { name: '모험가의 응원', cooldown: 5000, color: '#c9d6df', description: '기본 공격' };
}
const dungeonMonsters = [
  { name: '보랏빛 슬라임', x: 11 * TILE, y: 5 * TILE, homeX: 11 * TILE, homeY: 5 * TILE, hp: 34, maxHp: 34, baseHp: 34, reward: 100, baseReward: 100, experience: 35, baseExperience: 35, damage: 10, baseDamage: 10, level: 1, defeated: false, respawnAt: 0, lastHit: 0, color: '#9a69ce', kind: 'slime' },
  { name: '동굴 박쥐', x: 17 * TILE, y: 10 * TILE, homeX: 17 * TILE, homeY: 10 * TILE, hp: 42, maxHp: 42, baseHp: 42, reward: 100, baseReward: 100, experience: 45, baseExperience: 45, damage: 12, baseDamage: 12, level: 1, defeated: false, respawnAt: 0, lastHit: 0, color: '#7b82c8', kind: 'bat' },
  { name: '불꽃 골렘', x: 20 * TILE, y: 5 * TILE, homeX: 20 * TILE, homeY: 5 * TILE, hp: 58, maxHp: 58, baseHp: 58, reward: 150, baseReward: 150, experience: 65, baseExperience: 65, damage: 16, baseDamage: 16, level: 1, defeated: false, respawnAt: 0, lastHit: 0, color: '#d1724f', kind: 'golem' },
    { name: '그림자 늑대', x: 13 * TILE, y: 14 * TILE, homeX: 13 * TILE, homeY: 14 * TILE, hp: 50, maxHp: 50, baseHp: 50, reward: 150, baseReward: 150, experience: 55, baseExperience: 55, damage: 14, baseDamage: 14, level: 1, defeated: false, respawnAt: 0, lastHit: 0, color: '#54647d', kind: 'wolf' },
    { name: '독버섯', x: 7 * TILE, y: 6 * TILE, homeX: 7 * TILE, homeY: 6 * TILE, hp: 38, maxHp: 38, baseHp: 38, reward: 110, baseReward: 110, experience: 42, baseExperience: 42, damage: 11, baseDamage: 11, level: 1, defeated: false, respawnAt: 0, lastHit: 0, color: '#75b35d', kind: 'mushroom' },
    { name: '서리 정령', x: 8 * TILE, y: 13 * TILE, homeX: 8 * TILE, homeY: 13 * TILE, hp: 46, maxHp: 46, baseHp: 46, reward: 130, baseReward: 130, experience: 52, baseExperience: 52, damage: 13, baseDamage: 13, level: 1, defeated: false, respawnAt: 0, lastHit: 0, color: '#79d6ef', kind: 'wisp' },
    { name: '해골 검사', x: 18 * TILE, y: 14 * TILE, homeX: 18 * TILE, homeY: 14 * TILE, hp: 64, maxHp: 64, baseHp: 64, reward: 180, baseReward: 180, experience: 72, baseExperience: 72, damage: 18, baseDamage: 18, level: 1, defeated: false, respawnAt: 0, lastHit: 0, color: '#d6d1ba', kind: 'skeleton' },
    { name: '암흑 기사', x: 21 * TILE, y: 11 * TILE, homeX: 21 * TILE, homeY: 11 * TILE, hp: 82, maxHp: 82, baseHp: 82, reward: 220, baseReward: 220, experience: 90, baseExperience: 90, damage: 21, baseDamage: 21, level: 1, defeated: false, respawnAt: 0, lastHit: 0, color: '#6d638e', kind: 'knight' },
  ];

// 재생성될 때 사용할 몬스터 원본 정보입니다. 전투 중 변경되는 수치와 분리해 둡니다.
const monsterTemplates = dungeonMonsters.map(({ name, baseHp, baseReward, baseExperience, baseDamage, color, kind }) => ({
  name, baseHp, baseReward, baseExperience, baseDamage, color, kind,
}));

function rerollMonster(monster) {
  // 방금 처치한 몬스터와는 반드시 다른 종류를 고릅니다.
  const candidates = monsterTemplates.filter((template) => template.name !== monster.name);
  const template = candidates[Math.floor(Math.random() * candidates.length)];
  const levelIncrease = 1 + Math.floor(Math.random() * 3);

  Object.assign(monster, {
    name: template.name,
    baseHp: template.baseHp,
    baseReward: template.baseReward,
    baseExperience: template.baseExperience,
    baseDamage: template.baseDamage,
    color: template.color,
    kind: template.kind,
    level: monster.level + levelIncrease,
    defeated: false,
    lastHit: 0,
  });

  monster.maxHp = Math.ceil(monster.baseHp * (1 + (monster.level - 1) * .22));
  monster.hp = monster.maxHp;
  monster.damage = monster.baseDamage + (monster.level - 1) * 2;
  monster.reward = monster.baseReward + (monster.level - 1) * 35;
  monster.experience = monster.baseExperience + (monster.level - 1) * 12;
  monster.x = monster.homeX;
  monster.y = monster.homeY;
  return levelIncrease;
}

function rollTier() {
  const luck = rebirth.luckMultiplier;
  const chances = [
    ['absolute', Math.min(tiers.absolute.chance * luck, .0015)],
    ['transcendent', Math.min(tiers.transcendent.chance * luck, .004)],
    ['divine', Math.min(tiers.divine.chance * luck, .012)],
    ['ancient', Math.min(tiers.ancient.chance * luck, .03)],
    ['mythic', Math.min(tiers.mythic.chance * luck, .07)],
    ['legendary', Math.min(tiers.legendary.chance * luck, .22)],
    ['epic', Math.min(tiers.epic.chance * luck, .36)],
    ['rare', Math.min(tiers.rare.chance * Math.sqrt(luck), .42)],
  ];
  // 행운이 높아져도 일반 등급이 최소 2%는 남도록 전체 확률을 정규화합니다.
  const total = chances.reduce((sum, [, chance]) => sum + chance, 0);
  const scale = total > .98 ? .98 / total : 1;
  const roll = Math.random();
  let threshold = 0;
  for (const [tier, chance] of chances) {
    threshold += chance * scale;
    if (roll < threshold) return tier;
  }
  return 'normal';
}

function itemId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function normalizeGear(item) {
  if (typeof item === 'string') return { id: itemId(), name: item, tier: 'normal' };
  return { id: item.id ?? itemId(), name: item.name, tier: tiers[item.tier] ? item.tier : 'normal' };
}

function equippedTier() {
  const gear = [inventory.equipped.weapon, inventory.equipped.armor].filter(Boolean);
  return gear.reduce((best, item) => tiers[item.tier].rank > tiers[best].rank ? item.tier : best, 'normal');
}

function tileAt(x, y) {
  const col = Math.floor(x / TILE);
  const row = Math.floor(y / TILE);
  return map[row]?.[col] ?? '1';
}

function isBlocked(x, y) {
  if (inDungeon) return x < TILE || y < TILE || x + player.size > canvas.width - TILE || y + player.size > canvas.height - TILE;
  if (villageBackgroundReady) {
    return x < 10 || y < 10 || x + player.size > canvas.width - 10 || y + player.size > canvas.height - 10
      || villageObstacles.some((obstacle) => x + player.size > obstacle.x && x < obstacle.x + obstacle.width && y + player.size > obstacle.y && y < obstacle.y + obstacle.height);
  }
  const inset = 4;
  return [[x + inset, y + inset], [x + player.size - inset, y + inset], [x + inset, y + player.size - inset], [x + player.size - inset, y + player.size - inset]]
    .some(([px, py]) => ['1', '2', '4'].includes(tileAt(px, py)));
}

function move(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (!isBlocked(nx, player.y)) player.x = nx;
  if (!isBlocked(player.x, ny)) player.y = ny;
}

function nearbyNpc() {
  const distance = Math.hypot(player.x - npc.x, player.y - npc.y);
  if (distance < 48 && !greeted) {
    greeted = true;
    dialogue.textContent = '루나: 환영해요! 가까이에서 E를 누르면 부탁을 들려줄게요.';
    objective.textContent = '루나와 대화하기';
  }
}

function interactWithLuna() {
  if (quest.stage === 'none') {
    quest.stage = 'active';
    dialogue.textContent = `루나: 마을 곳곳에서 코인 ${quest.requiredCoins}개를 모아 줄래요?`;
    objective.textContent = `루나의 부탁: 코인 ${coins}/${quest.requiredCoins}`;
    updateQuestProgress();
  } else if (quest.stage === 'active') {
    dialogue.textContent = `루나: 코인 ${coins}/${quest.requiredCoins}개를 모아 주세요.`;
  } else if (quest.stage === 'complete') {
    quest.stage = 'claimed';
    skills.points += 1;
    updateSkillTree();
    dialogue.textContent = '루나: 정말 고마워요! 스킬 포인트 1개를 드릴게요.';
    objective.textContent = '루나의 퀘스트 완료 ✓';
  } else if (quest.secondStage === 'none') {
    quest.secondStage = 'active';
    quest.monsterKills = 0;
    dialogue.textContent = `루나: 이번엔 던전 몬스터 ${quest.requiredKills}마리를 처치해 주세요!`;
    objective.textContent = `루나의 토벌 의뢰: ${quest.monsterKills}/${quest.requiredKills}`;
  } else if (quest.secondStage === 'active') {
    dialogue.textContent = `루나: 던전 몬스터를 ${quest.monsterKills}/${quest.requiredKills}마리 처치해 주세요.`;
  } else if (quest.secondStage === 'complete') {
    quest.secondStage = 'claimed';
    coins += 500;
    skills.points += 2;
    updateCoins();
    updateSkillTree();
    updateShop();
      dialogue.textContent = '루나: 훌륭해요! 보상으로 500코인과 스킬 포인트 2개를 드릴게요.';
      objective.textContent = '루나의 토벌 의뢰 완료 ✓';
    } else if (quest.thirdStage === 'none') {
      quest.thirdStage = 'active'; quest.sellCount = 0;
      dialogue.textContent = `루나: 상점에서 쓰지 않는 장비나 동료 ${quest.requiredSells}개를 판매해 주세요.`;
      objective.textContent = `루나의 정리 의뢰: ${quest.sellCount}/${quest.requiredSells}`;
    } else if (quest.thirdStage === 'active') {
      dialogue.textContent = `루나: 장비나 동료를 ${quest.sellCount}/${quest.requiredSells}개 판매해 주세요.`;
    } else if (quest.thirdStage === 'complete') {
      quest.thirdStage = 'claimed'; coins += 750; skills.points += 2;
      updateCoins(); updateSkillTree(); updateShop();
      dialogue.textContent = '루나: 깔끔해졌네요! 750코인과 스킬 포인트 2개를 드릴게요.';
      objective.textContent = '루나의 정리 의뢰 완료 ✓';
    } else if (quest.fourthStage === 'none') {
      quest.fourthStage = 'active'; quest.synthesisCount = 0;
      dialogue.textContent = `루나: 합성을 ${quest.requiredSynthesis}번 성공시켜 더 강한 장비를 만들어 보세요!`;
      objective.textContent = `루나의 합성 의뢰: ${quest.synthesisCount}/${quest.requiredSynthesis}`;
    } else if (quest.fourthStage === 'active') {
      dialogue.textContent = `루나: 합성을 ${quest.synthesisCount}/${quest.requiredSynthesis}번 성공시켜 주세요.`;
    } else if (quest.fourthStage === 'complete') {
      quest.fourthStage = 'claimed'; coins += 1200; skills.points += 3;
      updateCoins(); updateSkillTree(); updateShop();
      dialogue.textContent = '루나: 대단해요! 1,200코인과 스킬 포인트 3개를 드릴게요.';
      objective.textContent = '루나의 합성 의뢰 완료 ✓';
  } else {
    dialogue.textContent = '루나: 던전을 탐험하기 전에 장비와 스킬을 잘 챙기세요! 새 의뢰는 준비 중이에요.';
  }
}

function updateQuestProgress() {
  if (quest.stage === 'active' && coins >= quest.requiredCoins) {
    quest.stage = 'complete';
    dialogue.textContent = '코인을 모두 모았어요! 루나에게 돌아가 E를 눌러 보상을 받으세요.';
    objective.textContent = '루나에게 돌아가기';
  } else if (quest.stage === 'active') {
    objective.textContent = `루나의 부탁: 코인 ${coins}/${quest.requiredCoins}`;
  }
}

function nearbyPortal() {
  const distance = Math.hypot(player.x - portal.x, player.y - portal.y);
  if (distance < 62 && !foundPortal) {
    foundPortal = true;
    dialogue.textContent = '던전 포탈을 발견했어요! 가까이 가서 E를 눌러 입장하세요.';
    objective.textContent = '던전 포탈 발견 ✓';
  }
}

function isNearPortal(target) {
  return Math.hypot(player.x - target.x, player.y - target.y) < 68;
}

function isNearShop() {
  return Math.hypot(player.x - shopDoor.x, player.y - shopDoor.y) < 78;
}

function enterDungeon() {
  inDungeon = true;
  dungeonMonsters.forEach((monster) => { monster.lastHit = 0; });
  player.x = 5 * TILE;
  player.y = 9 * TILE;
  dialogue.textContent = '던전에 입장했습니다. 왼쪽 귀환 포탈에서 E를 누르면 마을로 돌아갑니다.';
  objective.textContent = '던전 탐험 중';
}

function exitDungeon() {
  inDungeon = false;
  autoBattle = false;
  updateAutoButton();
  player.x = portal.x - 58;
  player.y = portal.y + 10;
  dialogue.textContent = '별빛 마을로 돌아왔습니다.';
  objective.textContent = '마을을 둘러보세요';
}

function interact() {
  if (!inDungeon && Math.hypot(player.x - npc.x, player.y - npc.y) < 60) interactWithLuna();
  else if (!inDungeon && isNearPortal(portal)) enterDungeon();
  else if (inDungeon && isNearPortal(dungeonExit)) exitDungeon();
  else dialogue.textContent = inDungeon ? '귀환 포탈 가까이에서 상호작용 버튼을 눌러주세요.' : '루나 또는 던전 포탈 가까이에서 상호작용해 주세요.';
}

function updateCoins() {
  coinBalance.textContent = `🪙 ${coins} 코인`;
  updateQuestProgress();
}

function gainCoins(amount) {
  const earned = Math.floor(amount * rebirth.coinMultiplier);
  coins += earned;
  updateCoins();
  return earned;
}

function updateRebirthUI() {
  rebirthInfo.textContent = `${rebirth.count}회 · 💰x${rebirth.coinMultiplier.toFixed(2)} · 🍀x${rebirth.luckMultiplier.toFixed(2)}`;
}

function performRebirth() {
  if (coins < 10000) {
    dialogue.textContent = `환생에는 10,000코인이 필요합니다. (${coins}/10000)`;
    return;
  }
  if (!confirm('환생하면 코인, 스킬트리, 무기·방어구·동료 인벤토리가 초기화됩니다. 환생할까요?')) return;
  coins = 0;
  ['weapon', 'armor', 'companion'].forEach((type) => {
    inventory[type] = 0;
    inventory.items[type] = [];
    inventory.equipped[type] = null;
  });
  rebirth.count += 1;
  rebirth.coinMultiplier += .25;
  rebirth.luckMultiplier += .25;
  skills.points = 5;
  skills.levels.strength = 0;
  skills.levels.guard = 0;
  skills.levels.vitality = 0;
  skills.bonusAttack = 0;
  skills.bonusDefense = 0;
  skills.bonusHealth = 0;
  updateCoins();
  updateInventory();
  updateSkillTree();
  updateShop();
  updateRebirthUI();
  dialogue.textContent = `♻ ${rebirth.count}회 환생! 코인과 스킬트리가 초기화되었습니다. 코인 획득 x${rebirth.coinMultiplier.toFixed(2)}, 행운 x${rebirth.luckMultiplier.toFixed(2)}, 스킬 포인트 5개로 재시작합니다.`;
  saveGame();
}

function healAtFountain(time) {
  if (Math.hypot(player.x - fountain.x, player.y - fountain.y) >= 68 || playerStats.health >= playerStats.maxHealth || time - lastFountainHeal < 600) return;
  lastFountainHeal = time;
  playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + 8);
  updateStats();
  dialogue.textContent = `분수의 물결이 체력을 회복합니다. (${playerStats.health}/${playerStats.maxHealth})`;
}

function updateStats() {
  const weaponIndex = equipment.weapon.indexOf(inventory.equipped.weapon?.name);
  const armorIndex = equipment.armor.indexOf(inventory.equipped.armor?.name);
  const weaponTierBonus = inventory.equipped.weapon ? tiers[inventory.equipped.weapon.tier].bonus : 0;
  const armorTierBonus = inventory.equipped.armor ? tiers[inventory.equipped.armor.tier].bonus : 0;
  playerStats.maxHealth = 100 + skills.bonusHealth;
  playerStats.health = Math.min(playerStats.health, playerStats.maxHealth);
  playerStats.attack = playerStats.baseAttack + skills.bonusAttack + weaponTierBonus + (weaponIndex < 0 ? 0 : equipmentPower.weapon[weaponIndex]);
  playerStats.defense = playerStats.baseDefense + skills.bonusDefense + armorTierBonus + (armorIndex < 0 ? 0 : equipmentPower.armor[armorIndex]);
  const health = Number.isInteger(playerStats.health) ? playerStats.health : playerStats.health.toFixed(1);
  healthValue.textContent = `${health} / ${playerStats.maxHealth}`;
  attackValue.textContent = playerStats.attack;
  defenseValue.textContent = playerStats.defense;
  damageReduction.textContent = `피해 -${Math.min(playerStats.defense * .1, 80).toFixed(1)}%`;
}

function updateLevel() {
  levelValue.textContent = `Lv.${playerLevel.level}`;
  experienceValue.textContent = `${playerLevel.experience} / ${playerLevel.nextExperience} EXP`;
}

function saveGame(showMessage = false) {
  try {
    const snapshot = {
      player: { x: player.x, y: player.y, direction: player.direction },
          coins, inDungeon, shopPrice, greeted, foundPortal, rebirth: { ...rebirth }, cosmetics: { ...cosmetics }, ownedCosmetics: [...ownedCosmetics],
      playerStats: { health: playerStats.health },
      playerLevel: { ...playerLevel },
      quest: { ...quest },
      skills: { points: skills.points, levels: { ...skills.levels }, bonusAttack: skills.bonusAttack, bonusDefense: skills.bonusDefense, bonusHealth: skills.bonusHealth },
      inventory: JSON.parse(JSON.stringify(inventory)),
      coinTaken: coinDrops.map((coin) => coin.taken),
      monsters: dungeonMonsters.map((monster) => ({ ...monster })),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    if (showMessage) dialogue.textContent = '💾 게임을 저장했습니다.';
  } catch {
    if (showMessage) dialogue.textContent = '저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.';
  }
}

function loadGame() {
  try {
    const rawSave = localStorage.getItem(SAVE_KEY);
    if (!rawSave) return false;
    const save = JSON.parse(rawSave);
    if (save.player) Object.assign(player, save.player);
    if (typeof save.coins === 'number') coins = save.coins;
    if (typeof save.inDungeon === 'boolean') inDungeon = save.inDungeon;
    if (typeof save.shopPrice === 'number') shopPrice = save.shopPrice;
      if (save.rebirth) Object.assign(rebirth, save.rebirth);
      if (save.cosmetics) Object.assign(cosmetics, save.cosmetics);
      save.ownedCosmetics?.forEach((key) => ownedCosmetics.add(key));
    greeted = Boolean(save.greeted);
    foundPortal = Boolean(save.foundPortal);
    if (save.playerStats) playerStats.health = save.playerStats.health ?? playerStats.health;
    if (save.playerLevel) Object.assign(playerLevel, save.playerLevel);
      if (save.quest) Object.assign(quest, save.quest);
      quest.secondStage ??= 'none'; quest.monsterKills ??= 0; quest.requiredKills ??= 3;
      quest.thirdStage ??= 'none'; quest.sellCount ??= 0; quest.requiredSells ??= 3;
      quest.fourthStage ??= 'none'; quest.synthesisCount ??= 0; quest.requiredSynthesis ??= 2;
    if (save.skills) {
      skills.points = save.skills.points ?? skills.points;
      Object.assign(skills.levels, save.skills.levels ?? {});
      skills.bonusAttack = save.skills.bonusAttack ?? skills.bonusAttack;
      skills.bonusDefense = save.skills.bonusDefense ?? skills.bonusDefense;
      skills.bonusHealth = save.skills.bonusHealth ?? skills.bonusHealth;
    }
    if (save.inventory) {
      Object.assign(inventory, save.inventory);
      inventory.items.companion ??= [];
      inventory.companion ??= 0;
      inventory.equipped.companion ??= null;
        ['weapon', 'armor', 'companion'].forEach((type) => {
          inventory.items[type] = (inventory.items[type] ?? []).map(normalizeGear);
          const savedEquipped = inventory.equipped[type] ? normalizeGear(inventory.equipped[type]) : null;
        inventory.equipped[type] = savedEquipped ? inventory.items[type].find((item) => item.id === savedEquipped.id || (item.name === savedEquipped.name && item.tier === savedEquipped.tier)) ?? savedEquipped : null;
      });
    }
    save.coinTaken?.forEach((taken, index) => { if (coinDrops[index]) coinDrops[index].taken = taken; });
      save.monsters?.forEach((savedMonster, index) => {
        if (!dungeonMonsters[index]) return;
        Object.assign(dungeonMonsters[index], savedMonster);
        // performance.now() 값은 브라우저를 새로 열면 다시 시작하므로 저장하지 않는다.
        dungeonMonsters[index].lastHit = 0;
        if (dungeonMonsters[index].defeated) dungeonMonsters[index].respawnAt = performance.now() + 1500;
      });
    return true;
  } catch {
    return false;
  }
}

function gainExperience(amount) {
  playerLevel.experience += amount;
  let levelsGained = 0;
  while (playerLevel.experience >= playerLevel.nextExperience) {
    playerLevel.experience -= playerLevel.nextExperience;
    playerLevel.level += 1;
    playerLevel.nextExperience = Math.ceil(playerLevel.nextExperience * 1.35 / 10) * 10;
    skills.points += 1;
    levelsGained += 1;
  }
  updateLevel();
  if (levelsGained) updateSkillTree();
  return levelsGained;
}

function updateShop() {
  capacityPrice.textContent = shopPrice;
  shopCapacity.textContent = inventory.max;
  capacityBuy.disabled = coins < shopPrice;
  companionBuy.disabled = coins < 300 || inventory.companion >= inventory.max;
  updateCosmeticShop();
}

function updateCosmeticShop() {
  cosmeticButtons.forEach((button) => {
    const option = cosmeticOptions[button.dataset.cosmetic];
    button.classList.toggle('owned', ownedCosmetics.has(button.dataset.cosmetic));
    button.classList.toggle('active', cosmetics[option.type] === option.value);
  });
}

function applyCosmetic(key) {
  const option = cosmeticOptions[key];
  if (!option) return;
  if (!ownedCosmetics.has(key)) {
    if (coins < 150) { dialogue.textContent = '새 꾸미기에는 150코인이 필요합니다.'; return; }
    coins -= 150;
    ownedCosmetics.add(key);
    updateCoins();
  }
  cosmetics[option.type] = option.value;
  updateCosmeticShop();
  dialogue.textContent = '✨ 캐릭터 꾸미기를 적용했습니다!';
}

function pullCompanion() {
  if (coins < 300) { dialogue.textContent = '동료 뽑기에는 300코인이 필요합니다.'; return; }
  if (inventory.companion >= inventory.max) { dialogue.textContent = '동료 인벤토리가 가득 찼습니다. 가방을 확장해 보세요.'; return; }
  coins -= 300;
  const companion = { id: itemId(), name: companionPool[Math.floor(Math.random() * companionPool.length)], tier: rollTier() };
  inventory.companion += 1;
  inventory.items.companion.push(companion);
  updateCoins();
  updateInventory();
  updateShop();
  dialogue.textContent = `🐾 [${tiers[companion.tier].label}] ${companion.name}을(를) 동료로 영입했습니다!`;
}

function sellPrice(type, item) {
  const base = type === 'companion' ? 180 : type === 'weapon' ? 120 : 100;
  return base * [1, 3, 8, 25, 80, 260, 850, 2800, 9000][tiers[item.tier].rank];
}

function sellItem(type, item) {
  const index = inventory.items[type].findIndex((owned) => owned.id === item.id);
  if (index < 0) return;
  inventory.items[type].splice(index, 1);
  inventory[type] -= 1;
  if (inventory.equipped[type]?.id === item.id) inventory.equipped[type] = null;
  const earned = gainCoins(sellPrice(type, item));
  updateInventory();
  updateShop();
  dialogue.textContent = `[${tiers[item.tier].label}] ${item.name} 판매! 🪙 ${earned}코인 획득`;
  registerSale(1);
}

function registerSale(count) {
  if (quest.thirdStage !== 'active') return;
  quest.sellCount += count;
  if (quest.sellCount >= quest.requiredSells) {
    quest.thirdStage = 'complete';
    objective.textContent = '루나에게 정리 의뢰 보고하기';
  } else {
    objective.textContent = `루나의 정리 의뢰: ${quest.sellCount}/${quest.requiredSells}`;
  }
}

function sellAllNormal() {
  const items = ['weapon', 'armor', 'companion'].flatMap((type) => inventory.items[type].filter((item) => item.tier === 'normal').map((item) => ({ type, item })));
  if (!items.length) { dialogue.textContent = '판매할 일반 등급 아이템이 없습니다.'; return; }
  let total = 0;
  items.forEach(({ type, item }) => {
    inventory.items[type] = inventory.items[type].filter((owned) => owned.id !== item.id);
    inventory[type] -= 1;
    if (inventory.equipped[type]?.id === item.id) inventory.equipped[type] = null;
    total += sellPrice(type, item);
  });
  const earned = gainCoins(total);
  registerSale(items.length);
  updateInventory(); updateShop();
  dialogue.textContent = `일반 등급 ${items.length}개를 판매해 🪙 ${earned}코인을 획득했습니다!`;
}

function synthesize(type) {
  const order = Object.keys(tiers);
  const maximumTier = order[order.length - 1];
  const sourceTier = order.find((tier) => inventory.items[type].filter((item) => item.tier === tier).length >= 3);
  if (!sourceTier) { dialogue.textContent = `${type === 'weapon' ? '무기' : type === 'armor' ? '방어구' : '동료'} 합성에는 같은 등급 아이템 3개가 필요합니다.`; return; }
  const ingredients = inventory.items[type].filter((item) => item.tier === sourceTier).slice(0, 3);
  inventory.items[type] = inventory.items[type].filter((item) => !ingredients.some((ingredient) => ingredient.id === item.id));
  inventory[type] -= 3;
  const sourceIndex = order.indexOf(sourceTier);
  const bigSuccess = sourceIndex < order.length - 2 && Math.random() < Math.min(.12 * rebirth.luckMultiplier, .45);
  const nextTier = sourceTier === maximumTier ? maximumTier : order[Math.min(order.length - 1, sourceIndex + (bigSuccess ? 2 : 1))];
  const pool = type === 'companion' ? companionPool : equipment[type];
  const item = { id: itemId(), name: pool[Math.floor(Math.random() * pool.length)], tier: nextTier };
  inventory.items[type].push(item);
  inventory[type] += 1;
  if (!inventory.equipped[type] || ingredients.some((ingredient) => ingredient.id === inventory.equipped[type]?.id)) inventory.equipped[type] = item;
  updateInventory();
  registerSynthesis();
  dialogue.textContent = sourceTier === maximumTier
    ? `🔧 절대 재련 성공! 새로운 [절대] ${item.name}을(를) 얻었습니다!`
    : `🔧 ${bigSuccess ? '대성공! ' : ''}${tiers[sourceTier].label} 3개를 합성해 [${tiers[nextTier].label}] ${item.name}을(를) 만들었습니다!`;
}

function registerSynthesis() {
  if (quest.fourthStage !== 'active') return;
  quest.synthesisCount += 1;
  if (quest.synthesisCount >= quest.requiredSynthesis) {
    quest.fourthStage = 'complete';
    objective.textContent = '루나에게 합성 의뢰 보고하기';
  } else {
    objective.textContent = `루나의 합성 의뢰: ${quest.synthesisCount}/${quest.requiredSynthesis}`;
  }
}

function buyCapacity() {
  if (coins < shopPrice) {
    dialogue.textContent = `코인이 부족해요. 인벤토리 확장에는 ${shopPrice}코인이 필요합니다.`;
    return;
  }
  coins -= shopPrice;
  inventory.max += 5;
  shopPrice = Math.ceil(shopPrice * 1.5 / 50) * 50;
  updateCoins();
  updateInventory();
  updateShop();
  dialogue.textContent = `인벤토리를 확장했어요! 무기와 방어구가 각각 ${inventory.max}칸이 되었습니다.`;
}

function updateSkillTree() {
  skillPointsLabel.textContent = `${skills.points}P`;
  skillPanelPoints.textContent = skills.points;
  skillNodes.forEach((node) => {
    const level = skills.levels[node.dataset.skill];
    node.classList.toggle('unlocked', level > 0);
    const text = node.dataset.skill === 'strength' ? '공격력 +3' : node.dataset.skill === 'guard' ? '방어력 +3' : '최대 체력 +20';
    node.querySelector('small').textContent = `${text} · Lv.${level} · 1P`;
  });
  updateStats();
}

function unlockSkill(skill) {
  if (skills.points < 1) return;
  skills.points -= 1;
  skills.levels[skill] += 1;
  if (skill === 'strength') skills.bonusAttack += 3;
  if (skill === 'guard') skills.bonusDefense += 3;
  if (skill === 'vitality') {
    skills.bonusHealth += 20;
    playerStats.health += 20;
  }
  updateSkillTree();
  dialogue.textContent = `${skill === 'strength' ? '전사의 힘' : skill === 'guard' ? '강철 피부' : '생명력'} Lv.${skills.levels[skill]} 강화 완료!`;
}

function collectCoins() {
  coinDrops.forEach((coin) => {
      if (coin.taken || Math.hypot(player.x - coin.x, player.y - coin.y) >= 24) return;
      coin.taken = true;
      const earned = gainCoins(coin.value);
      dialogue.textContent = `🪙 ${earned} 코인을 획득했어요! (보유: ${coins})`;
  });
}

function updateInventory() {
  inventoryLabel.textContent = `무기 ${inventory.weapon}/${inventory.max} · 방어구 ${inventory.armor}/${inventory.max} · 동료 ${inventory.companion}/${inventory.max}`;
  weaponCount.textContent = `${inventory.weapon}/${inventory.max}`;
  armorCount.textContent = `${inventory.armor}/${inventory.max}`;
  companionCount.textContent = `${inventory.companion}/${inventory.max}`;
  renderItemList('weapon', weaponList, inventory.items.weapon);
  renderItemList('armor', armorList, inventory.items.armor);
  renderItemList('companion', companionList, inventory.items.companion);
  renderEquippedSlot('weapon', equippedWeapon);
  renderEquippedSlot('armor', equippedArmor);
  renderEquippedSlot('companion', equippedCompanion);
  updateStats();
}

function renderItemList(type, list, items) {
  list.replaceChildren();
  for (let slot = 0; slot < inventory.max; slot += 1) {
    const element = document.createElement('li');
    if (items[slot]) {
      const item = items[slot];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'inventory-item';
      const equipped = inventory.equipped[type]?.id === item.id;
      if (equipped) button.classList.add('equipped');
      const tier = tiers[item.tier];
      element.classList.add(`tier-${item.tier}`);
      button.style.setProperty('--tier-color', tier.color);
      const art = document.createElement('span');
      art.className = `item-art ${type}-art`;
      art.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
        name.textContent = type === 'companion' ? `[${tier.label}] ${item.name} · ${getCompanionSkill(item.name).name}` : `[${tier.label}] ${item.name}`;
      button.append(art, name);
      button.addEventListener('click', () => equipItem(type, item));
      element.append(button);
    } else {
      element.textContent = '빈 슬롯';
      element.classList.add('empty');
    }
    list.append(element);
  }
}

function renderEquippedSlot(type, slot) {
  slot.replaceChildren();
  const art = document.createElement('span');
  art.className = `item-art ${type}-art`;
  art.setAttribute('aria-hidden', 'true');
  const name = document.createElement('span');
  const item = inventory.equipped[type];
  if (item) {
    if (type === 'companion') {
      slot.className = `equipment-slot companion-equipped tier-${item.tier}`;
        name.textContent = `[${tiers[item.tier].label}] ${item.name} · ${getCompanionSkill(item.name).name}`;
    } else {
      slot.className = `equipment-slot tier-${item.tier}`;
      name.textContent = `[${tiers[item.tier].label}] ${item.name}`;
    }
  } else {
    slot.className = 'equipment-slot';
    name.textContent = `${type === 'weapon' ? '무기' : type === 'armor' ? '방어구' : '동료'} 미장착`;
  }
  slot.append(art, name);
}

function equipItem(type, item) {
  inventory.equipped[type] = item;
  updateInventory();
  if (type === 'companion') dialogue.textContent = `동료 장착: [${tiers[item.tier].label}] ${item.name}. 던전에서 자동 공격합니다!`;
  else dialogue.textContent = `${type === 'weapon' ? '무기' : '방어구'} 장착: [${tiers[item.tier].label}] ${item.name}`;
}

function itemPower(type, item) {
  const tier = tiers[item.tier] ?? tiers.normal;
  if (type === 'companion') return tier.rank * 100;
  const index = equipment[type].indexOf(item.name);
  return (index < 0 ? 0 : equipmentPower[type][index]) + tier.bonus;
}

function bestItem(type) {
  const current = inventory.equipped[type];
  return inventory.items[type].reduce((best, item) => {
    if (!best) return item;
    const difference = itemPower(type, item) - itemPower(type, best);
    if (difference > 0) return item;
    // 동점일 때는 이미 장착한 아이템을 유지해 의도치 않은 교체를 막습니다.
    if (difference === 0 && current?.id === item.id) return item;
    return best;
  }, null);
}

function equipBestItems() {
  const changed = [];
  ['weapon', 'armor', 'companion'].forEach((type) => {
    const item = bestItem(type);
    if (item && inventory.equipped[type]?.id !== item.id) {
      inventory.equipped[type] = item;
      changed.push(type === 'weapon' ? '무기' : type === 'armor' ? '방어구' : '동료');
    }
  });
  if (!inventory.items.weapon.length && !inventory.items.armor.length && !inventory.items.companion.length) {
    dialogue.textContent = '최고 장착할 장비나 동료가 없습니다.';
    return;
  }
  updateInventory();
  saveGame();
  dialogue.textContent = changed.length ? `⚡ 최고 장착 완료: ${changed.join(' · ')}` : '이미 가장 좋은 장비와 동료를 장착하고 있습니다.';
}

function setInventoryOpen(open) {
  inventoryPanel.hidden = !open;
  inventoryButton.setAttribute('aria-expanded', String(open));
}

function setSkillOpen(open) {
  skillPanel.hidden = !open;
  skillButton.setAttribute('aria-expanded', String(open));
}

function setShopOpen(open) {
  shopPanel.hidden = !open;
  if (open) updateShop();
}

function diceBounds() {
  return { x: player.x + 1, y: player.y - 23, size: 20 };
}

function rollDice() {
  if (rolling) return;
  const available = ['weapon', 'armor'].filter((type) => inventory[type] < inventory.max);
  if (!available.length) {
    dialogue.textContent = '모든 장비를 모았어요! 무기와 방어구가 5/5입니다.';
    return;
  }

  rolling = true;
  let flashes = 0;
  const spinner = setInterval(() => {
    rollFrame = (rollFrame + 1) % 3;
    const preview = flashes % 2 ? '🗡️ 무기' : '🛡️ 방어구';
    dialogue.textContent = `주사위를 굴리는 중... ${preview}`;
    flashes += 1;
  }, 100);

  setTimeout(() => {
    clearInterval(spinner);
    const type = available[Math.floor(Math.random() * available.length)];
      const item = { id: itemId(), name: equipment[type][inventory[type] % equipment[type].length], tier: rollTier() };
    inventory[type] += 1;
    inventory.items[type].push(item);
    if (!inventory.equipped[type]) inventory.equipped[type] = item;
    updateInventory();
    const label = type === 'weapon' ? '무기' : '방어구';
    const icon = type === 'weapon' ? '🗡️' : '🛡️';
      dialogue.textContent = `${icon} ${label} 획득: [${tiers[item.tier].label}] ${item.name} (${inventory[type]}/${inventory.max})`;
    rolling = false;
  }, 950);
}

function updateAutoDiceButton() {
  autoDiceButton.classList.toggle('active', autoDice);
  autoDiceButton.setAttribute('aria-pressed', String(autoDice));
  autoDiceButton.textContent = autoDice ? '🎲 자동 주사위 켜짐' : '🎲 자동 주사위';
}

function toggleAutoDice() {
  autoDice = !autoDice;
  nextAutoDiceAt = performance.now();
  updateAutoDiceButton();
  dialogue.textContent = autoDice ? '자동 주사위 굴리기를 시작합니다!' : '자동 주사위 굴리기를 멈췄습니다.';
}

function updateAutoDice(time) {
  if (!autoDice || rolling || time < nextAutoDiceAt) return;
  const hasSpace = ['weapon', 'armor'].some((type) => inventory[type] < inventory.max);
  if (!hasSpace) {
    autoDice = false;
    updateAutoDiceButton();
    dialogue.textContent = '무기와 방어구 인벤토리가 가득 차 자동 주사위를 멈췄습니다.';
    return;
  }
  rollDice();
  nextAutoDiceAt = time + 1200;
}

function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }

function drawTile(type, x, y) {
  rect(x, y, TILE, TILE, '#72bd67');
  if (type === '0' || type === '5') {
    rect(x + 4, y + 7, 2, 2, '#83ca72'); rect(x + 24, y + 20, 2, 2, '#5bac5e');
  }
  if (type === '1') {
    rect(x, y, TILE, TILE, '#579e56');
    rect(x + 13, y + 17, 7, 15, '#765133');
    ctx.fillStyle = '#286c45'; ctx.beginPath(); ctx.arc(x + 16, y + 13, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3b914f'; ctx.beginPath(); ctx.arc(x + 10, y + 11, 8, 0, Math.PI * 2); ctx.fill();
  }
  if (type === '2') {
    rect(x, y, TILE, TILE, '#4da9c8');
    rect(x + 4, y + 9, 10, 2, '#8ed8e5'); rect(x + 18, y + 22, 8, 2, '#8ed8e5');
  }
  if (type === '3') {
    rect(x, y, TILE, TILE, '#d9b878');
    rect(x + 2, y + 2, 28, 28, '#d1aa68');
    rect(x + 5, y + 5, 4, 3, '#e6ca8a'); rect(x + 20, y + 19, 4, 3, '#b78f53');
  }
  if (type === '4') {
    rect(x, y, TILE, TILE, '#78b963');
    rect(x + 3, y + 12, 26, 20, '#e4c78f');
    rect(x + 1, y + 5, 30, 11, '#bd624e');
    rect(x + 5, y + 2, 22, 5, '#f0a365');
    rect(x + 12, y + 21, 8, 11, '#835641');
    rect(x + 6, y + 19, 4, 5, '#8cc4d5'); rect(x + 22, y + 19, 4, 5, '#8cc4d5');
  }
  if (type === '5') {
    ctx.fillStyle = '#f5f0b0'; ctx.beginPath(); ctx.arc(x + 14, y + 14, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f183a3'; ctx.beginPath(); ctx.arc(x + 18, y + 18, 4, 0, Math.PI * 2); ctx.fill();
  }
}

function drawVillageBackground() {
  if (!villageBackgroundReady) {
    map.forEach((row, rowIndex) => [...row].forEach((tile, colIndex) => drawTile(tile, colIndex * TILE, rowIndex * TILE)));
    return;
  }
  ctx.drawImage(villageBackground, 0, 0, canvas.width, canvas.height);
  const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 140, canvas.width / 2, canvas.height / 2, 570);
  vignette.addColorStop(0, 'rgba(13, 33, 40, 0)');
  vignette.addColorStop(1, 'rgba(3, 10, 25, .33)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGearAura(x, y) {
  const tierName = equippedTier();
  const tier = tiers[tierName];
  if (tier.rank === 0) return;
  const time = performance.now() / 500;
  const rank = tier.rank;
  const auraColor = rank === 8 ? `hsl(${(time * 85) % 360} 100% 72%)` : tier.color;
  ctx.save();
  ctx.globalAlpha = Math.min(.42 + rank * .045, .84);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 1.5 + Math.min(rank, 8) * .45;
  ctx.beginPath(); ctx.arc(x + 11, y + 13, 17 + Math.sin(time) * 2, 0, Math.PI * 2); ctx.stroke();
  if (rank >= 2) {
    const particleCount = Math.min(4 + rank * 2, 20);
    for (let index = 0; index < particleCount; index += 1) {
      const angle = time * (1 + rank * .25) + index * Math.PI * 2 / particleCount;
      const radius = 19 + rank * 2.2;
      const px = x + 11 + Math.cos(angle) * radius;
      const py = y + 13 + Math.sin(angle) * radius;
      ctx.fillStyle = rank === 8 ? `hsl(${((time * 110) + index * 35) % 360} 100% 72%)` : tier.color;
      ctx.beginPath(); ctx.arc(px, py, 1.4 + rank * .18, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (rank >= 3) {
    ctx.globalAlpha = .28 + Math.min(rank, 8) * .04; ctx.lineWidth = 3 + rank * .38;
    ctx.beginPath(); ctx.arc(x + 11, y + 13, 23 + rank * 2, time, time + Math.PI * 1.5); ctx.stroke();
  }
  if (rank >= 5) {
    ctx.globalAlpha = .5; ctx.lineWidth = 1.5;
    for (let index = 0; index < 3; index += 1) {
      const rotation = -time * (1 + index * .2) + index * Math.PI * 2 / 3;
      ctx.beginPath(); ctx.ellipse(x + 11, y + 13, 29 + rank * 2 + index * 4, 9 + index * 3, rotation, 0, Math.PI * 2); ctx.stroke();
    }
  }
  if (rank >= 7) {
    ctx.globalAlpha = .82; ctx.fillStyle = rank === 8 ? auraColor : '#ffffff';
    for (let index = 0; index < rank - 3; index += 1) {
      const angle = time * 2.2 + index * Math.PI * 2 / (rank - 3);
      const px = x + 11 + Math.cos(angle) * (31 + rank * 2);
      const py = y + 13 + Math.sin(angle) * (31 + rank * 2);
      ctx.beginPath(); ctx.moveTo(px, py - 3); ctx.lineTo(px + 2, py); ctx.lineTo(px, py + 3); ctx.lineTo(px - 2, py); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}

function drawCharacter(character, isPlayer = false) {
  const { x, y } = character;
  if (isPlayer) drawGearAura(x, y);
  const centerX = x + 11;
  const armorColor = inventory.equipped.armor ? tiers[inventory.equipped.armor.tier].color : '#4a74bd';
  const robe = isPlayer ? armorColor : '#9e5fb5';
  ctx.save();
  ctx.fillStyle = 'rgba(7, 18, 26, .38)'; ctx.beginPath(); ctx.ellipse(centerX, y + 27, 15, 4.8, 0, 0, Math.PI * 2); ctx.fill();

  const cloak = ctx.createLinearGradient(x + 2, y + 12, x + 21, y + 26);
  cloak.addColorStop(0, isPlayer ? cosmetics.cloak : '#704b8c'); cloak.addColorStop(.58, isPlayer ? '#243b68' : '#3b285d'); cloak.addColorStop(1, '#15233c');
  ctx.fillStyle = cloak; ctx.beginPath(); ctx.moveTo(x + 5, y + 13); ctx.quadraticCurveTo(centerX, y + 10, x + 18, y + 14); ctx.lineTo(x + 21, y + 26); ctx.lineTo(x + 1, y + 26); ctx.closePath(); ctx.fill();

  const body = ctx.createLinearGradient(x + 4, y + 13, x + 19, y + 25);
  body.addColorStop(0, '#ffffff'); body.addColorStop(.08, robe); body.addColorStop(.62, robe); body.addColorStop(1, '#25355d');
  ctx.fillStyle = body; ctx.beginPath(); ctx.roundRect(x + 5, y + 13, 13, 13, 5); ctx.fill();
  ctx.fillStyle = 'rgba(255, 240, 170, .68)'; ctx.fillRect(x + 7, y + 18, 9, 1.5);
  ctx.fillStyle = '#263244'; ctx.beginPath(); ctx.roundRect(x + 5, y + 24, 5, 4, 1.5); ctx.roundRect(x + 13, y + 24, 5, 4, 1.5); ctx.fill();
  ctx.fillStyle = '#f1c59d'; ctx.beginPath(); ctx.arc(x + 3.7, y + 17, 2.6, 0, Math.PI * 2); ctx.arc(x + 18.3, y + 17, 2.6, 0, Math.PI * 2); ctx.fill();

  const skin = ctx.createRadialGradient(x + 8, y + 6, 1, centerX, y + 10, 9);
  skin.addColorStop(0, '#fff0cb'); skin.addColorStop(.58, '#f5c99c'); skin.addColorStop(1, '#be785f');
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(centerX, y + 9.5, 7.5, 0, Math.PI * 2); ctx.fill();
  const hair = ctx.createLinearGradient(x + 4, y + 2, x + 17, y + 12);
  hair.addColorStop(0, isPlayer ? cosmetics.hair : '#4f3565'); hair.addColorStop(1, '#201c36');
  ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(centerX, y + 7, 7.8, Math.PI, Math.PI * 2); ctx.lineTo(x + 17.7, y + 9); ctx.lineTo(x + 15.5, y + 5); ctx.lineTo(x + 12, y + 8); ctx.lineTo(x + 8, y + 4); ctx.lineTo(x + 5, y + 11); ctx.lineTo(x + 3.6, y + 7); ctx.closePath(); ctx.fill();
  if (isPlayer) { ctx.fillStyle = cosmetics.charm === 'flower' ? '#ff9dcb' : '#ffe686'; ctx.beginPath(); ctx.arc(x + 18, y + 4, 2.8, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#fffdf2'; ctx.beginPath(); ctx.arc(x + 8.4, y + 10, 1.55, 0, Math.PI * 2); ctx.arc(x + 13.8, y + 10, 1.55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#26314b'; ctx.beginPath(); ctx.arc(x + 8.5, y + 10.1, .7, 0, Math.PI * 2); ctx.arc(x + 13.9, y + 10.1, .7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b96668'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(centerX, y + 13.2, 1.9, .1, Math.PI - .1); ctx.stroke();
  if (isPlayer && inventory.equipped.weapon) {
    const weaponTier = tiers[inventory.equipped.weapon.tier];
    ctx.strokeStyle = 'rgba(0, 0, 0, .28)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 19, y + 19); ctx.lineTo(x + 27, y + 7); ctx.stroke();
    const blade = ctx.createLinearGradient(x + 19, y + 19, x + 27, y + 7);
    blade.addColorStop(0, weaponTier.color); blade.addColorStop(.45, '#ffffff'); blade.addColorStop(1, weaponTier.color);
    ctx.strokeStyle = blade; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 19, y + 18); ctx.lineTo(x + 27, y + 6); ctx.stroke();
    ctx.strokeStyle = '#f2c76b'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x + 17, y + 16); ctx.lineTo(x + 23, y + 20); ctx.stroke();
  }
  if (!isPlayer) {
    ctx.font = 'bold 12px Malgun Gothic'; ctx.textAlign = 'center';
    const width = ctx.measureText(character.name).width + 14;
    ctx.fillStyle = 'rgba(18, 28, 49, .78)'; ctx.beginPath(); ctx.roundRect(centerX - width / 2, y - 17, width, 15, 7); ctx.fill();
    ctx.fillStyle = '#fff5c3'; ctx.fillText(character.name, centerX, y - 6);
  }
  ctx.restore();
}

function drawCompanion() {
  const companion = inventory.equipped.companion;
  if (!companion) return;
  const bob = Math.sin(performance.now() / 180) * 2;
  const x = player.x - 17;
  const y = player.y + 8 + bob;
  const { name, tier } = companion;
  const colors = { '구름 고양이': '#d7e9f5', '불꽃 여우': '#f28d55', '달빛 토끼': '#d3bcf6', '꼬마 드래곤': '#6ec7a9', '수정 요정': '#85d9ec', '별빛 강아지': '#eac174', '번개 다람쥐': '#d9c65f', '바다 거북': '#5bb59c', '꽃 정령': '#ec8cb5', '미니 골렘': '#ab8b70' };
  const tierInfo = tiers[tier];
  const color = colors[name] ?? '#f4a164';
  ctx.save();
  ctx.fillStyle = 'rgba(7, 18, 26, .32)'; ctx.beginPath(); ctx.ellipse(x + 10, y + 22, 12, 3.8, 0, 0, Math.PI * 2); ctx.fill();
  if (tierInfo.rank > 0) {
    ctx.strokeStyle = tierInfo.rank === 8 ? `hsl(${(performance.now() / 7) % 360} 100% 75%)` : tierInfo.color;
    ctx.lineWidth = Math.min(tierInfo.rank + 1, 5); ctx.globalAlpha = .68;
    ctx.beginPath(); ctx.arc(x + 10, y + 11, 14 + Math.sin(performance.now() / 130) * 2, 0, Math.PI * 2); ctx.stroke();
    if (tierInfo.rank >= 4) {
      const sparks = Math.min(tierInfo.rank + 1, 8);
      for (let index = 0; index < sparks; index += 1) {
        const angle = performance.now() / 280 + index * Math.PI * 2 / sparks;
        const px = x + 10 + Math.cos(angle) * (17 + tierInfo.rank * 1.5);
        const py = y + 11 + Math.sin(angle) * (17 + tierInfo.rank * 1.5);
        ctx.fillStyle = tierInfo.rank === 8 ? `hsl(${((performance.now() / 7) + index * 42) % 360} 100% 75%)` : tierInfo.color;
        ctx.beginPath(); ctx.arc(px, py, 1 + tierInfo.rank * .12, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  const body = ctx.createRadialGradient(x + 6, y + 6, 1, x + 11, y + 13, 13);
  body.addColorStop(0, '#fffde5'); body.addColorStop(.2, color); body.addColorStop(.78, color); body.addColorStop(1, '#253048');
  const earOrWing = (name === '구름 고양이' || name === '불꽃 여우' || name === '별빛 강아지' || name === '번개 다람쥐');
  if (name === '달빛 토끼') {
    ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(x + 5, y + 3, 3.2, 10, -.25, 0, Math.PI * 2); ctx.ellipse(x + 15, y + 3, 3.2, 10, .25, 0, Math.PI * 2); ctx.fill();
  } else if (earOrWing) {
    ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(x + 3, y + 10); ctx.lineTo(x + 5, y - 2); ctx.lineTo(x + 10, y + 7); ctx.lineTo(x + 16, y - 2); ctx.lineTo(x + 19, y + 11); ctx.closePath(); ctx.fill();
  } else if (name === '꼬마 드래곤' || name === '수정 요정') {
    ctx.globalAlpha = .72; ctx.fillStyle = name === '꼬마 드래곤' ? '#80d7bb' : '#c5f8ff'; ctx.beginPath(); ctx.ellipse(x + 2, y + 9, 5, 11, -.65, 0, Math.PI * 2); ctx.ellipse(x + 18, y + 9, 5, 11, .65, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  } else if (name === '꽃 정령') {
    ctx.fillStyle = '#ffd1e6'; [0, 1, 2, 3, 4].forEach((index) => { const angle = index * Math.PI * 2 / 5; ctx.beginPath(); ctx.ellipse(x + 10 + Math.cos(angle) * 8, y + 8 + Math.sin(angle) * 8, 3.5, 6, angle, 0, Math.PI * 2); ctx.fill(); });
  }
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(x + 10, y + 13, name === '바다 거북' ? 10 : 8.8, 9, 0, 0, Math.PI * 2); ctx.fill();
  if (name === '바다 거북') { ctx.fillStyle = '#315f59'; ctx.beginPath(); ctx.ellipse(x + 10, y + 13, 6.5, 6.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#9dd7ba'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 4, y + 13); ctx.lineTo(x + 16, y + 13); ctx.moveTo(x + 10, y + 6); ctx.lineTo(x + 10, y + 20); ctx.stroke(); }
  if (name === '미니 골렘') { ctx.fillStyle = '#685648'; ctx.beginPath(); ctx.roundRect(x + 2, y + 5, 16, 16, 4); ctx.fill(); }
  ctx.fillStyle = 'rgba(255, 255, 255, .5)'; ctx.beginPath(); ctx.ellipse(x + 6.5, y + 8.5, 2.8, 1.8, -.45, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fffdf0'; ctx.beginPath(); ctx.arc(x + 7, y + 12, 2.1, 0, Math.PI * 2); ctx.arc(x + 13, y + 12, 2.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#283246'; ctx.beginPath(); ctx.arc(x + 7, y + 12, .9, 0, Math.PI * 2); ctx.arc(x + 13, y + 12, .9, 0, Math.PI * 2); ctx.fill();
  if (name === '불꽃 여우' || name === '번개 다람쥐') { ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 18, y + 16, 5, -.9, 1.6); ctx.stroke(); }
  ctx.font = 'bold 9px Malgun Gothic'; ctx.textAlign = 'center'; const label = `${name} [${tierInfo.label}]`; const labelWidth = ctx.measureText(label).width + 8; ctx.fillStyle = 'rgba(17, 30, 47, .78)'; ctx.beginPath(); ctx.roundRect(x + 10 - labelWidth / 2, y - 11, labelWidth, 12, 6); ctx.fill(); ctx.fillStyle = tierInfo.color; ctx.fillText(label, x + 10, y - 2);
  ctx.restore();
}

function drawDice() {
  const { x, y, size } = diceBounds();
  const hop = rolling ? (rollFrame === 1 ? -4 : rollFrame === 2 ? 2 : 0) : 0;
  const dy = y + hop;
  ctx.save();
  ctx.fillStyle = 'rgba(6, 17, 25, .36)'; ctx.beginPath(); ctx.ellipse(x + size / 2, dy + size + 5, 11, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rolling ? '#d79939' : '#b9c2cb'; ctx.beginPath(); ctx.moveTo(x + 2, dy + 6); ctx.lineTo(x + 16, dy + 10); ctx.lineTo(x + 16, dy + 24); ctx.lineTo(x + 2, dy + 19); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rolling ? '#b77624' : '#8c98aa'; ctx.beginPath(); ctx.moveTo(x + 16, dy + 10); ctx.lineTo(x + 22, dy + 5); ctx.lineTo(x + 22, dy + 18); ctx.lineTo(x + 16, dy + 24); ctx.closePath(); ctx.fill();
  const top = ctx.createLinearGradient(x + 4, dy + 2, x + 18, dy + 14);
  top.addColorStop(0, '#ffffff'); top.addColorStop(.35, rolling ? '#ffe39a' : '#f7fafc'); top.addColorStop(1, rolling ? '#e7ab43' : '#ccd7e2');
  ctx.fillStyle = top; ctx.beginPath(); ctx.moveTo(x + 2, dy + 6); ctx.lineTo(x + 9, dy + 1); ctx.lineTo(x + 22, dy + 5); ctx.lineTo(x + 16, dy + 10); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#526070'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#be4652'; [[7, 8], [13, 10], [18, 6]].slice(0, rolling ? rollFrame + 1 : 3).forEach(([dx, dotY]) => { ctx.beginPath(); ctx.arc(x + dx, dy + dotY, 1.35, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}

function drawFountain() {
  const pulse = 5 + Math.sin(performance.now() / 210) * 2;
  ctx.save();
  const glow = ctx.createRadialGradient(fountain.x, fountain.y, 2, fountain.x, fountain.y, 62);
  glow.addColorStop(0, 'rgba(162, 242, 255, .62)'); glow.addColorStop(1, 'rgba(68, 184, 255, 0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(fountain.x, fountain.y, 62, 0, Math.PI * 2); ctx.fill();
  if (!villageBackgroundReady) { ctx.fillStyle = '#547087'; ctx.beginPath(); ctx.ellipse(fountain.x, fountain.y + 9, 32, 15, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#b6f9ff'; ctx.lineWidth = 2; ctx.globalAlpha = .78; ctx.beginPath(); ctx.ellipse(fountain.x, fountain.y + 5, 24 + pulse, 9 + pulse / 3, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#d8ffff'; ctx.font = 'bold 10px Malgun Gothic'; ctx.textAlign = 'center'; ctx.fillText('회복 분수', fountain.x, fountain.y - 43); ctx.restore();
}

function drawPortal() {
  const { x, y, size } = portal;
  const pulse = 2 + Math.sin(performance.now() / 220) * 2;
  const cx = x + size / 2; const cy = y + size / 2;
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 57); glow.addColorStop(0, 'rgba(238, 127, 255, .76)'); glow.addColorStop(1, 'rgba(143, 65, 241, 0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 57, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(9, 11, 35, .58)'; ctx.beginPath(); ctx.ellipse(cx, y + size - 2, 29, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#4a3d68'; ctx.lineWidth = 12; ctx.beginPath(); ctx.ellipse(cx, cy, 20 + pulse, 28 + pulse, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#a987ed'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(cx, cy, 18 + pulse, 26 + pulse, 0, 0, Math.PI * 2); ctx.stroke();
  const core = ctx.createRadialGradient(cx - 5, cy - 8, 1, cx, cy, 25); core.addColorStop(0, '#fff2ff'); core.addColorStop(.35, '#cb60ff'); core.addColorStop(1, '#48218d'); ctx.fillStyle = core; ctx.beginPath(); ctx.ellipse(cx, cy, 13 + pulse / 2, 20 + pulse / 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f5dcff'; ctx.font = 'bold 11px Malgun Gothic'; ctx.textAlign = 'center'; ctx.fillText('던전 · E', cx, y - 9); ctx.restore();
}

function drawShopSign() {
  const x = shopDoor.x;
  ctx.save(); ctx.fillStyle = 'rgba(13, 20, 30, .45)'; ctx.beginPath(); ctx.roundRect(x - 31, shopDoor.y - 59, 62, 19, 6); ctx.fill(); ctx.strokeStyle = '#edc976'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#fff0bc'; ctx.font = 'bold 11px Malgun Gothic'; ctx.textAlign = 'center'; ctx.fillText('상점 · Q', x, shopDoor.y - 46); ctx.restore();
}

function drawMonster(monster) {
  const { x, y } = monster;
  const centerX = x + 16;
  const kind = monster.kind ?? ({ '보랏빛 슬라임': 'slime', '동굴 박쥐': 'bat', '불꽃 골렘': 'golem', '그림자 늑대': 'wolf' }[monster.name] ?? 'slime');
  ctx.save();
  ctx.fillStyle = 'rgba(3, 6, 15, .48)'; ctx.beginPath(); ctx.ellipse(centerX, y + 28, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  let eyeY = 16;
  if (kind === 'slime') {
    const jelly = ctx.createRadialGradient(x + 10, y + 8, 1, centerX, y + 18, 20); jelly.addColorStop(0, '#f1c6ff'); jelly.addColorStop(.25, monster.color); jelly.addColorStop(1, '#4b3372');
    ctx.fillStyle = jelly; ctx.beginPath(); ctx.moveTo(x + 3, y + 25); ctx.quadraticCurveTo(x + 2, y + 10, centerX, y + 8); ctx.quadraticCurveTo(x + 30, y + 10, x + 29, y + 25); ctx.quadraticCurveTo(centerX, y + 30, x + 3, y + 25); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.48)'; ctx.beginPath(); ctx.ellipse(x + 10, y + 14, 4, 2, -.55, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = .5; [0, 1].forEach((index) => { ctx.beginPath(); ctx.arc(x + 23 + index * 3, y + 10 - index * 5, 2 + index, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1;
  } else if (kind === 'bat') {
    const wing = ctx.createLinearGradient(x, y + 8, x + 32, y + 24); wing.addColorStop(0, '#abb9ff'); wing.addColorStop(1, '#373964'); ctx.fillStyle = wing;
    ctx.beginPath(); ctx.moveTo(centerX - 2, y + 14); ctx.lineTo(x + 1, y + 6); ctx.lineTo(x + 3, y + 22); ctx.lineTo(x + 10, y + 19); ctx.lineTo(x + 13, y + 25); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(centerX + 2, y + 14); ctx.lineTo(x + 31, y + 6); ctx.lineTo(x + 29, y + 22); ctx.lineTo(x + 22, y + 19); ctx.lineTo(x + 19, y + 25); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#46426e'; ctx.beginPath(); ctx.moveTo(x + 11, y + 13); ctx.lineTo(x + 13, y + 4); ctx.lineTo(centerX, y + 10); ctx.lineTo(x + 19, y + 4); ctx.lineTo(x + 21, y + 13); ctx.ellipse(centerX, y + 17, 7, 9, 0, 0, Math.PI * 2); ctx.fill(); eyeY = 15;
  } else if (kind === 'golem') {
    const rock = ctx.createLinearGradient(x + 4, y + 5, x + 27, y + 27); rock.addColorStop(0, '#f0a36d'); rock.addColorStop(.35, '#9f4f45'); rock.addColorStop(1, '#3e3343'); ctx.fillStyle = rock;
    [[4, 12, 9, 10], [13, 6, 10, 11], [21, 13, 8, 11], [10, 18, 12, 9]].forEach(([px, py, w, h]) => { ctx.beginPath(); ctx.roundRect(x + px, y + py, w, h, 3); ctx.fill(); });
    const fire = ctx.createRadialGradient(centerX, y + 18, 1, centerX, y + 18, 8); fire.addColorStop(0, '#fff6a9'); fire.addColorStop(.35, '#ffb13d'); fire.addColorStop(1, '#d94a35'); ctx.fillStyle = fire; ctx.beginPath(); ctx.arc(centerX, y + 18, 7, 0, Math.PI * 2); ctx.fill(); eyeY = 13;
  } else if (kind === 'wolf') {
    ctx.fillStyle = '#30374d'; ctx.beginPath(); ctx.moveTo(x + 6, y + 20); ctx.lineTo(x, y + 15); ctx.lineTo(x + 4, y + 13); ctx.lineTo(x + 10, y + 18); ctx.closePath(); ctx.fill();
    const fur = ctx.createLinearGradient(x + 7, y + 7, x + 25, y + 27); fur.addColorStop(0, '#9da9c7'); fur.addColorStop(.4, monster.color); fur.addColorStop(1, '#252b40'); ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(x + 14, y + 19, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 17, y + 17); ctx.lineTo(x + 18, y + 6); ctx.lineTo(x + 22, y + 11); ctx.lineTo(x + 26, y + 6); ctx.lineTo(x + 28, y + 17); ctx.ellipse(x + 22, y + 17, 7, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#d5d9e7'; ctx.beginPath(); ctx.ellipse(x + 28, y + 20, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); eyeY = 15;
  } else if (kind === 'mushroom') {
    ctx.fillStyle = '#e7d9bd'; ctx.beginPath(); ctx.roundRect(x + 11, y + 13, 10, 13, 4); ctx.fill(); const cap = ctx.createRadialGradient(x + 11, y + 5, 1, centerX, y + 10, 18); cap.addColorStop(0, '#ffd0bb'); cap.addColorStop(.35, '#d77978'); cap.addColorStop(1, '#783f66'); ctx.fillStyle = cap; ctx.beginPath(); ctx.arc(centerX, y + 12, 16, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#fff0cb'; [[11, 8], [22, 11], [16, 5]].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(x + px, y + py, 2, 0, Math.PI * 2); ctx.fill(); }); eyeY = 19;
  } else if (kind === 'wisp') {
    const glow = ctx.createRadialGradient(centerX, y + 13, 1, centerX, y + 13, 29); glow.addColorStop(0, 'rgba(235, 255, 255, .95)'); glow.addColorStop(.35, 'rgba(121, 223, 255, .7)'); glow.addColorStop(1, 'rgba(96, 218, 255, 0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(centerX, y + 13, 29, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#9ff6ff'; ctx.beginPath(); ctx.moveTo(centerX, y + 2); ctx.quadraticCurveTo(x + 29, y + 15, centerX, y + 28); ctx.quadraticCurveTo(x + 3, y + 15, centerX, y + 2); ctx.fill(); eyeY = 14;
  } else if (kind === 'skeleton') {
    ctx.strokeStyle = '#f3eed7'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(centerX, y + 14); ctx.lineTo(centerX, y + 26); ctx.moveTo(x + 8, y + 20); ctx.lineTo(x + 24, y + 20); ctx.moveTo(x + 12, y + 27); ctx.lineTo(x + 8, y + 31); ctx.moveTo(x + 20, y + 27); ctx.lineTo(x + 24, y + 31); ctx.stroke(); ctx.fillStyle = '#e8e1c7'; ctx.beginPath(); ctx.roundRect(x + 9, y + 4, 14, 13, 5); ctx.fill(); ctx.fillStyle = '#303145'; ctx.beginPath(); ctx.arc(x + 13, y + 10, 2.5, 0, Math.PI * 2); ctx.arc(x + 19, y + 10, 2.5, 0, Math.PI * 2); ctx.fill(); eyeY = -99;
  } else {
    const cloak = ctx.createLinearGradient(x + 6, y + 7, x + 26, y + 28); cloak.addColorStop(0, '#8e82b9'); cloak.addColorStop(.35, '#4b456d'); cloak.addColorStop(1, '#1c2036'); ctx.fillStyle = cloak; ctx.beginPath(); ctx.moveTo(x + 9, y + 8); ctx.lineTo(x + 23, y + 8); ctx.lineTo(x + 28, y + 28); ctx.lineTo(x + 5, y + 28); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#34324d'; ctx.beginPath(); ctx.roundRect(x + 9, y + 4, 14, 14, 4); ctx.fill(); ctx.fillStyle = '#ff7dd7'; ctx.beginPath(); ctx.arc(x + 13, y + 11, 2, 0, Math.PI * 2); ctx.arc(x + 19, y + 11, 2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#d7e3f2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 26, y + 25); ctx.lineTo(x + 32, y + 5); ctx.stroke(); eyeY = -99;
  }
  if (eyeY > 0) { ctx.fillStyle = '#fff7e4'; ctx.beginPath(); ctx.arc(x + 11, y + eyeY, 2.8, 0, Math.PI * 2); ctx.arc(x + 21, y + eyeY, 2.8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = kind === 'wisp' ? '#236d8e' : '#2d2638'; ctx.beginPath(); ctx.arc(x + 11, y + eyeY, 1.1, 0, Math.PI * 2); ctx.arc(x + 21, y + eyeY, 1.1, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(29, 19, 37, .78)'; ctx.beginPath(); ctx.roundRect(x - 2, y - 13, 36, 5, 3); ctx.fill(); const hpGradient = ctx.createLinearGradient(x, y, x + 30, y); hpGradient.addColorStop(0, '#ff9b8e'); hpGradient.addColorStop(1, '#ef4568'); ctx.fillStyle = hpGradient; ctx.beginPath(); ctx.roundRect(x, y - 12, 32 * Math.max(monster.hp, 0) / monster.maxHp, 3, 2); ctx.fill();
  ctx.font = 'bold 10px Malgun Gothic'; ctx.textAlign = 'center'; const label = `${monster.name} Lv.${monster.level}`; const labelWidth = ctx.measureText(label).width + 10; ctx.fillStyle = 'rgba(14, 19, 35, .78)'; ctx.beginPath(); ctx.roundRect(centerX - labelWidth / 2, y - 31, labelWidth, 14, 7); ctx.fill(); ctx.fillStyle = '#fff0df'; ctx.fillText(label, centerX, y - 21);
  ctx.restore();
}

function directionVector() {
  if (player.direction === 'left') return { x: -1, y: 0 };
  if (player.direction === 'right') return { x: 1, y: 0 };
  if (player.direction === 'up') return { x: 0, y: -1 };
  return { x: 0, y: 1 };
}

function isRangedWeapon() {
  return inventory.equipped.weapon?.name.includes('활') || inventory.equipped.weapon?.name.includes('지팡이');
}

function attackMonster(monster, damage, source = 'player') {
  monster.hp -= damage;
  if (monster.hp > 0) {
    dialogue.textContent = `${source === 'companion' ? '동료의 공격! ' : ''}${monster.name}에게 ${damage} 피해를 입혔어요.`;
    return;
  }
    monster.hp = 0;
    monster.defeated = true;
    monster.respawnAt = performance.now() + 6000;
    const earnedCoins = gainCoins(monster.reward);
      const levelsGained = gainExperience(monster.experience);
      updateShop();
      dialogue.textContent = `${source === 'companion' ? '동료가 ' : ''}${monster.name} 처치! 🪙 ${earnedCoins}코인 · EXP +${monster.experience}${levelsGained ? ` · 레벨 업! 스킬 포인트 +${levelsGained}` : ''}`;
      if (quest.secondStage === 'active') {
        quest.monsterKills += 1;
        if (quest.monsterKills >= quest.requiredKills) {
          quest.secondStage = 'complete';
          dialogue.textContent = '루나의 토벌 의뢰를 완료했어요! 루나에게 돌아가 E를 눌러 보상을 받으세요.';
          objective.textContent = '루나에게 토벌 보고하기';
        } else {
          objective.textContent = `루나의 토벌 의뢰: ${quest.monsterKills}/${quest.requiredKills}`;
        }
      }
  }

function updateCompanionCombat(time) {
  const companion = inventory.equipped.companion;
  if (!inDungeon || !companion || time < companionAttackCooldown) return;
  const target = dungeonMonsters.filter((monster) => !monster.defeated).sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
  if (!target || Math.hypot(target.x - player.x, target.y - player.y) > 185) return;
  const damage = 4 + Math.floor(playerLevel.level * .8) + tiers[companion.tier].rank * 3;
  companionAttackCooldown = time + 750;
  companionEffect = { x: player.x - 7, y: player.y + 18, targetX: target.x + 16, targetY: target.y + 14, expires: time + 180 };
  attackMonster(target, damage, 'companion');
}

function useCompanionSkill() {
  const time = performance.now();
  const companion = inventory.equipped.companion;
  if (!inDungeon) { dialogue.textContent = '동료 스킬은 던전에서 사용할 수 있습니다.'; return; }
  if (!companion) { dialogue.textContent = '먼저 동료를 장착해 주세요.'; return; }
  if (time < companionSkillCooldown) {
    dialogue.textContent = `${getCompanionSkill(companion.name).name} 재사용 대기: ${((companionSkillCooldown - time) / 1000).toFixed(1)}초`;
    return;
  }
  const skill = getCompanionSkill(companion.name);
  const alive = dungeonMonsters.filter((monster) => !monster.defeated);
  const target = alive.sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
  if (!target && companion.name !== '구름 고양이' && companion.name !== '달빛 토끼') { dialogue.textContent = '공격할 몬스터가 없습니다.'; return; }
  companionSkillCooldown = time + skill.cooldown;
  companionSkillEffect = { x: player.x + 11, y: player.y + 12, targetX: target?.x + 16, targetY: target?.y + 14, color: skill.color, expires: time + 500 };
  const gradeBonus = tiers[companion.tier].rank;
  if (companion.name === '구름 고양이') {
    playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + 18 + gradeBonus * 5);
    updateStats();
    dialogue.textContent = `${skill.name}! 체력을 18 회복했습니다.`;
  } else if (companion.name === '달빛 토끼') {
    companionShieldUntil = time + 4000 + gradeBonus * 500;
    dialogue.textContent = `${skill.name}! 보호막이 더 강해집니다.`;
  } else if (companion.name === '꼬마 드래곤') {
    alive.filter((monster) => Math.hypot(monster.x - player.x, monster.y - player.y) < 175).forEach((monster) => attackMonster(monster, 9 + playerLevel.level + gradeBonus * 4, 'companion'));
    dialogue.textContent = `${skill.name}! 주변 적에게 불길을 뿜었습니다.`;
  } else {
    const multiplier = companion.name === '별빛 강아지' ? 2.8 : companion.name === '불꽃 여우' ? 2.1 : 1.8;
    attackMonster(target, Math.ceil((6 + playerLevel.level + gradeBonus * 3) * multiplier), 'companion');
    dialogue.textContent = `${skill.name} 발동!`;
  }
}

function performAttack() {
  if (!inDungeon || performance.now() < attackCooldown || playerStats.health <= 0) return;
  attackCooldown = performance.now() + 360;
  const direction = directionVector();
  const origin = { x: player.x + 11, y: player.y + 13 };
  if (isRangedWeapon()) {
    projectiles.push({ x: origin.x, y: origin.y, vx: direction.x * 330, vy: direction.y * 330, damage: playerStats.attack, expires: performance.now() + 1100 });
    dialogue.textContent = '원거리 발사체를 발사했습니다!';
  } else {
    meleeEffect = { x: origin.x, y: origin.y, dx: direction.x, dy: direction.y, facing: player.direction, expires: performance.now() + 170 };
    dungeonMonsters.filter((monster) => !monster.defeated).forEach((monster) => {
      const dx = monster.x + 16 - origin.x; const dy = monster.y + 16 - origin.y;
      if (Math.hypot(dx, dy) < 62 && dx * direction.x + dy * direction.y > -8) attackMonster(monster, playerStats.attack);
    });
  }
}

function updateAutoButton() {
  autoButton.classList.toggle('active', autoBattle);
  autoButton.setAttribute('aria-pressed', String(autoBattle));
  autoButton.textContent = autoBattle ? '🤖 AUTO 켜짐' : '🤖 AUTO';
}

function toggleAutoBattle() {
  if (!inDungeon) {
    dialogue.textContent = 'AUTO는 던전에 들어간 뒤 사용할 수 있습니다.';
    return;
  }
  autoBattle = !autoBattle;
  updateAutoButton();
  dialogue.textContent = autoBattle ? 'AUTO 사냥을 시작합니다!' : 'AUTO 사냥을 멈췄습니다.';
}

function updateAutoBattle(time, delta) {
  if (!autoBattle || !inDungeon || playerStats.health <= 0) return;
  const target = dungeonMonsters
    .filter((monster) => !monster.defeated)
    .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
  if (!target) return;

  const dx = target.x + 16 - (player.x + player.size / 2);
  const dy = target.y + 16 - (player.y + player.size / 2);
  const distance = Math.hypot(dx, dy) || 1;
  if (Math.abs(dx) > Math.abs(dy)) player.direction = dx < 0 ? 'left' : 'right';
  else player.direction = dy < 0 ? 'up' : 'down';
  if (distance > 49) move(dx / distance * player.speed * .62 * delta, dy / distance * player.speed * .62 * delta);
  else performAttack();
}

function updateCombat(time, delta) {
  if (!inDungeon) return;
  dungeonMonsters.filter((monster) => monster.defeated && time >= monster.respawnAt).forEach((monster) => {
    const levelIncrease = rerollMonster(monster);
    dialogue.textContent = `새 몬스터 ${monster.name}이(가) Lv.${monster.level} (+${levelIncrease})로 나타났습니다!`;
  });
  dungeonMonsters.filter((monster) => !monster.defeated).forEach((monster) => {
    const dx = player.x - monster.x; const dy = player.y - monster.y; const distance = Math.hypot(dx, dy) || 1;
      if (distance < 150 && distance > 38) { monster.x += dx / distance * 25 * delta; monster.y += dy / distance * 25 * delta; }
      if (distance <= 46 && time - monster.lastHit >= 900) {
      monster.lastHit = time;
        const shield = time < companionShieldUntil ? 6 : 0;
        const defenseRate = Math.min(playerStats.defense * .001, .8);
        const damage = Math.max(1, Number((monster.damage * (1 - defenseRate) - shield).toFixed(2)));
      playerStats.health = Math.max(0, playerStats.health - damage);
      updateStats();
        dialogue.textContent = `${monster.name}의 공격! ${damage} 피해를 받았습니다. (방어력 피해 감소 ${(defenseRate * 100).toFixed(1)}%${shield ? ' · 달빛 보호막 적용' : ''})`;
      if (playerStats.health === 0) {
        playerStats.health = playerStats.maxHealth;
        exitDungeon();
        dialogue.textContent = '쓰러져 마을로 돌아왔습니다. 체력이 회복되었습니다.';
      }
      }
    });
    updateCompanionCombat(time);
    for (let index = projectiles.length - 1; index >= 0; index -= 1) {
    const projectile = projectiles[index];
    projectile.x += projectile.vx * delta; projectile.y += projectile.vy * delta;
    const hit = dungeonMonsters.find((monster) => !monster.defeated && Math.hypot(monster.x + 16 - projectile.x, monster.y + 16 - projectile.y) < 19);
    if (hit) { attackMonster(hit, projectile.damage); projectiles.splice(index, 1); }
    else if (time > projectile.expires) projectiles.splice(index, 1);
  }
}

function drawCombatEffects() {
  if (meleeEffect && performance.now() < meleeEffect.expires) {
    const { x, y, dx, dy, facing } = meleeEffect;
    const rotation = facing === 'right' ? 0 : facing === 'down' ? Math.PI / 2 : facing === 'left' ? Math.PI : -Math.PI / 2;
    ctx.strokeStyle = '#fff3a1'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x + dx * 18, y + dy * 18, 24, rotation - 1.05, rotation + 1.05); ctx.stroke();
  }
  projectiles.forEach((projectile) => {
    ctx.fillStyle = '#ffe78a'; ctx.beginPath(); ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff8d0'; ctx.beginPath(); ctx.arc(projectile.x - projectile.vx / 110, projectile.y - projectile.vy / 110, 2, 0, Math.PI * 2); ctx.fill();
  });
  if (companionEffect && performance.now() < companionEffect.expires) {
    ctx.strokeStyle = '#9cf4dd'; ctx.lineWidth = 2; ctx.globalAlpha = .75; ctx.beginPath(); ctx.moveTo(companionEffect.x, companionEffect.y); ctx.lineTo(companionEffect.targetX, companionEffect.targetY); ctx.stroke();
    ctx.fillStyle = '#fff5ad'; ctx.beginPath(); ctx.arc(companionEffect.targetX, companionEffect.targetY, 5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }
  if (companionSkillEffect && performance.now() < companionSkillEffect.expires) {
    const effect = companionSkillEffect;
    ctx.strokeStyle = effect.color; ctx.lineWidth = 4; ctx.globalAlpha = .7;
    ctx.beginPath(); ctx.arc(effect.x, effect.y, 20 + Math.sin(performance.now() / 70) * 4, 0, Math.PI * 2); ctx.stroke();
    if (effect.targetX) { ctx.beginPath(); ctx.moveTo(effect.x, effect.y); ctx.lineTo(effect.targetX, effect.targetY); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  if (performance.now() < companionShieldUntil) {
    ctx.strokeStyle = '#d9b5ff'; ctx.lineWidth = 2; ctx.globalAlpha = .65; ctx.beginPath(); ctx.arc(player.x + 11, player.y + 12, 23 + Math.sin(performance.now() / 120) * 2, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  }
}

function drawDungeon() {
  const floor = ctx.createRadialGradient(canvas.width * .53, canvas.height * .44, 30, canvas.width * .53, canvas.height * .44, 620);
  floor.addColorStop(0, '#4b4a66'); floor.addColorStop(.48, '#292d46'); floor.addColorStop(1, '#12172a');
  ctx.fillStyle = floor; ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = TILE; y < canvas.height - TILE; y += TILE) {
    for (let x = TILE; x < canvas.width - TILE; x += TILE) {
      const top = (x / TILE + y / TILE) % 2 ? '#383d59' : '#424765';
      ctx.fillStyle = top; ctx.beginPath(); ctx.roundRect(x + 1, y + 1, TILE - 2, TILE - 2, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(194, 201, 241, .14)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 4, y + 3); ctx.lineTo(x + TILE - 4, y + 3); ctx.moveTo(x + 3, y + 4); ctx.lineTo(x + 3, y + TILE - 4); ctx.stroke();
      ctx.strokeStyle = 'rgba(3, 5, 15, .42)'; ctx.beginPath(); ctx.moveTo(x + TILE - 3, y + 5); ctx.lineTo(x + TILE - 3, y + TILE - 4); ctx.moveTo(x + 5, y + TILE - 3); ctx.lineTo(x + TILE - 3, y + TILE - 3); ctx.stroke();
    }
  }
  const wall = ctx.createLinearGradient(0, 0, 0, TILE); wall.addColorStop(0, '#6e7391'); wall.addColorStop(1, '#32374f');
  ctx.fillStyle = wall; ctx.fillRect(0, 0, canvas.width, TILE); ctx.fillRect(0, canvas.height - TILE, canvas.width, TILE);
  ctx.fillStyle = '#3a3e59'; ctx.fillRect(0, 0, TILE, canvas.height); ctx.fillRect(canvas.width - TILE, 0, TILE, canvas.height);
  ctx.strokeStyle = 'rgba(218, 198, 255, .22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(TILE, TILE); ctx.lineTo(canvas.width - TILE, TILE); ctx.moveTo(TILE, canvas.height - TILE); ctx.lineTo(canvas.width - TILE, canvas.height - TILE); ctx.stroke();
  const { x, y, size } = dungeonExit;
  const returnGlow = ctx.createRadialGradient(x + size / 2, y + 23, 3, x + size / 2, y + 23, 40); returnGlow.addColorStop(0, 'rgba(196, 255, 233, .8)'); returnGlow.addColorStop(1, 'rgba(85, 220, 181, 0)'); ctx.fillStyle = returnGlow; ctx.beginPath(); ctx.arc(x + size / 2, y + 23, 40, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#315d63'; ctx.lineWidth = 11; ctx.beginPath(); ctx.ellipse(x + size / 2, y + 23, 17, 24, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#7ce6c2'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x + size / 2, y + 23, 16, 23, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#bfffee'; ctx.beginPath(); ctx.ellipse(x + size / 2, y + 23, 8, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#dffff2'; ctx.font = 'bold 11px Malgun Gothic'; ctx.textAlign = 'center'; ctx.fillText('귀환 E', x + size / 2, y - 4);
  ctx.fillStyle = '#e8b4eb'; ctx.font = 'bold 17px Malgun Gothic'; ctx.textAlign = 'center'; ctx.fillText('별빛 던전 · 심층', canvas.width / 2, 56);
}

function drawCoins() {
  const shimmer = Math.sin(performance.now() / 250) > 0 ? 0 : 1;
  coinDrops.filter((coin) => !coin.taken).forEach((coin) => {
    ctx.save(); ctx.fillStyle = 'rgba(6, 18, 24, .3)'; ctx.beginPath(); ctx.ellipse(coin.x + 7, coin.y + 15, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
    const coinFace = ctx.createRadialGradient(coin.x + 4, coin.y + 4, 1, coin.x + 7, coin.y + 8, 8); coinFace.addColorStop(0, '#fff8af'); coinFace.addColorStop(.45, '#f5bf37'); coinFace.addColorStop(1, '#9a561d'); ctx.fillStyle = coinFace; ctx.beginPath(); ctx.arc(coin.x + 7, coin.y + 8, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffe786'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(coin.x + 7, coin.y + 8, 5, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = shimmer ? '#fff7bc' : '#f6c548'; ctx.beginPath(); ctx.arc(coin.x + 5, coin.y + 5, 1.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (inDungeon) {
    drawDungeon();
    dungeonMonsters.filter((monster) => !monster.defeated).forEach(drawMonster);
    drawCombatEffects();
    drawCompanion();
    drawCharacter(player, true);
    drawDice();
  } else {
    drawVillageBackground();
    drawFountain();
    drawPortal();
    drawShopSign();
    drawCoins();
    drawCharacter(npc);
    drawCompanion();
    drawCharacter(player, true);
    drawDice();
  }
}

function update(time) {
  const delta = Math.min((time - lastTime) / 1000 || 0, .05);
  lastTime = time;
  let dx = 0, dy = 0;
  if (keys.has('arrowleft') || keys.has('a')) { dx -= player.speed * delta; player.direction = 'left'; }
  if (keys.has('arrowright') || keys.has('d')) { dx += player.speed * delta; player.direction = 'right'; }
  if (keys.has('arrowup') || keys.has('w')) { dy -= player.speed * delta; player.direction = 'up'; }
  if (keys.has('arrowdown') || keys.has('s')) { dy += player.speed * delta; player.direction = 'down'; }
  if (dx || dy) move(dx, dy);
  if (!inDungeon) {
    nearbyNpc();
    nearbyPortal();
    collectCoins();
    healAtFountain(time);
  }
  updateAutoDice(time);
  updateAutoBattle(time, delta);
  updateCombat(time, delta);
  draw();
  requestAnimationFrame(update);
}

addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(key)) event.preventDefault();
  if (key === 'r') {
    player.x = start.x; player.y = start.y; greeted = false;
    dialogue.textContent = '시작 위치로 돌아왔어요.';
    objective.textContent = '마을을 둘러보세요';
  }
  if (key === 'i') {
    event.preventDefault();
    setInventoryOpen(inventoryPanel.hidden);
  }
  if (key === 'k') {
    event.preventDefault();
    setSkillOpen(skillPanel.hidden);
  }
  if (key === 'q' && !event.repeat) {
    event.preventDefault();
    if (!inDungeon && isNearShop()) setShopOpen(true);
    else dialogue.textContent = '상점이 있는 집 가까이에서 Q를 눌러주세요.';
  }
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault();
    performAttack();
  }
  if (key === 'f' && !event.repeat) {
    event.preventDefault();
    rollDice();
  }
  if (key === 'g' && !event.repeat) {
    event.preventDefault();
    toggleAutoDice();
  }
  if (key === 'c' && !event.repeat) {
    event.preventDefault();
    useCompanionSkill();
  }
  if (key === 'z' && !event.repeat) {
    event.preventDefault();
    toggleAutoBattle();
  }
  if (key === 'e' && !event.repeat) {
    event.preventDefault();
    interact();
  }
  if (key === 'escape') { setInventoryOpen(false); setSkillOpen(false); setShopOpen(false); }
  keys.add(key);
});
addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));

canvas.addEventListener('click', (event) => {
  const bounds = canvas.getBoundingClientRect();
  const x = (event.clientX - bounds.left) * (canvas.width / bounds.width);
  const y = (event.clientY - bounds.top) * (canvas.height / bounds.height);
  const dice = diceBounds();
  if (x >= dice.x - 4 && x <= dice.x + dice.size + 4 && y >= dice.y - 4 && y <= dice.y + dice.size + 4) rollDice();
});

function setDeviceMode(mode) {
  document.body.classList.toggle('mobile-mode', mode === 'mobile');
  devicePicker.hidden = true;
}

deviceButtons.forEach((button) => button.addEventListener('click', () => setDeviceMode(button.dataset.device)));

const moveKeyByDirection = { up: 'arrowup', left: 'arrowleft', down: 'arrowdown', right: 'arrowright' };
mobileMoveButtons.forEach((button) => {
  const key = moveKeyByDirection[button.dataset.move];
  const release = (event) => { event.preventDefault(); keys.delete(key); };
  button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture?.(event.pointerId); keys.add(key); });
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
});

mobileActionButtons.forEach((button) => button.addEventListener('click', () => {
  const action = button.dataset.action;
  if (action === 'attack') performAttack();
  if (action === 'interact') interact();
  if (action === 'dice') rollDice();
  if (action === 'companion') useCompanionSkill();
  if (action === 'auto') toggleAutoBattle();
  if (action === 'auto-dice') toggleAutoDice();
  if (action === 'inventory') setInventoryOpen(inventoryPanel.hidden);
}));

inventoryButton.addEventListener('click', () => setInventoryOpen(inventoryPanel.hidden));
autoButton.addEventListener('click', toggleAutoBattle);
autoDiceButton.addEventListener('click', toggleAutoDice);
inventoryClose.addEventListener('click', () => setInventoryOpen(false));
bestEquipButton.addEventListener('click', equipBestItems);
skillButton.addEventListener('click', () => setSkillOpen(skillPanel.hidden));
skillClose.addEventListener('click', () => setSkillOpen(false));
skillNodes.forEach((node) => node.addEventListener('click', () => unlockSkill(node.dataset.skill)));
shopClose.addEventListener('click', () => setShopOpen(false));
capacityBuy.addEventListener('click', buyCapacity);
companionBuy.addEventListener('click', pullCompanion);
synthesisButtons.forEach((button) => button.addEventListener('click', () => synthesize(button.dataset.synthesize)));
sellNormalButton.addEventListener('click', sellAllNormal);
cosmeticButtons.forEach((button) => button.addEventListener('click', () => applyCosmetic(button.dataset.cosmetic)));
saveButton.addEventListener('click', () => saveGame(true));
rebirthButton.addEventListener('click', performRebirth);
addEventListener('beforeunload', () => saveGame());

const restoredSave = loadGame();
updateInventory();
updateCoins();
updateStats();
updateLevel();
updateSkillTree();
updateShop();
updateRebirthUI();
if (restoredSave) dialogue.textContent = '💾 저장된 모험을 불러왔습니다.';
draw();
requestAnimationFrame(update);
setInterval(() => saveGame(), 10000);
