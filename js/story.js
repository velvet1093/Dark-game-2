'use strict';
// ---------------------------------------------------------------------------
// Ashen Vow — Remembrances: five memories the knight gets back, one at a time,
// out of order, wherever the world shakes them loose. With all five he has his
// name again, and the end of the road has a third way to go.
// ---------------------------------------------------------------------------
(() => {
  G.NAME = 'Corin';
  G.MEMORIES = {
    mill: {
      title: 'Remembrance: The Mill',
      where: 'the first candle on the Gallows Road',
      slides: [
        'A mill on a slow brown river. Flour in the air like snow that never lands.',
        'A girl, small for her age, lining up river stones on the mill step and naming each one. "That one is Mother. That one is the King. That one is you."\n\n"Which one is you?"\n\n"I am not a stone, stupid. I am the one who remembers."',
        'You cannot see her face. Only her hands, white with flour, and the stones in a row.',
      ],
    },
    muster: {
      title: 'Remembrance: The Muster',
      where: 'the roll of the Long Battalion, in the Wreck',
      slides: [
        'The square at Brannoc\'s Hold, full of banners and rain. Seven hundred men in borrowed steel.',
        'A priest goes down the line with a book. To each man he says, "Give it up, for the Saint will know you by your deeds." And each man says his name one last time, and the priest strikes it out.',
        'Somewhere behind the barrier a girl is shouting a name. Yours. Over and over. You can see her mouth make it.\n\nThe drums start, and you never hear it.',
      ],
    },
    blessing: {
      title: 'Remembrance: The Blessing',
      where: 'Malvern, when he falls',
      slides: [
        'The night before the Battalion marched, a bishop came to bless the officers in the cathedral nave. A tall man with cold hands and a kind voice.',
        '"Bring back the Tear," Malvern said, "and the Saint need never suffer."\n\nYou asked which saint. There was no saint in Morrowmere yet.\n\nHe smiled at you as if you had said something very clever, and did not answer.',
        'He knew. Seven years before her eyes ran red, he already knew whose they would be.',
      ],
    },
    letter: {
      title: 'Remembrance: The Letter',
      where: 'the Abbess, when she falls',
      slides: [
        'The third winter in the east. A letter, carried four hundred leagues in a dead man\'s satchel, written in a neat convent hand that was not hers.',
        '"Mother Severine is writing this for me, because I still cannot spell. I am learning washing here. The Abbess says I have the hands for it. I wash the sick, brother. I am not afraid of them.\n\nI say your name every night, so I will not forget it. You do not have to say mine. I know you are not allowed."',
        'You burned it, because a knight of the Battalion keeps nothing. You remember burning it. You do not remember the name at the bottom. Not yet.',
      ],
    },
    sun: {
      title: 'Remembrance: The Sun',
      where: 'the Windcaller, when he falls',
      slides: [
        'The voyage home. The Sun heeling in a wind like a wall. Men weeping in the hold, and the sound carrying up through the deck like singing.',
        'A sailor, drunk and frightened, talking at the rail: "There\'s a saint in Morrowmere now. Weeps the plague, and doesn\'t die of it. A girl. A miller\'s girl, out of Hollowmere."',
        'You held the Tear in your fist so hard it cut you. You did not ask her name. You did not have to.',
      ],
    },
  };
  // The fifth one, whichever it is, ends with this.
  G.NAMED = [
    'The stones on the mill step. The shouting behind the barrier. The bottom of the letter, in a hand that was not hers:',
    '"...so I will not forget it.\n\nYour sister, Ysolde, who still says it every night:\n\nCORIN."',
    'Your name is Corin.\n\nYou say it out loud, on the road, to nobody. It sounds like someone else. Then it does not.',
  ];
  G.FAIRY.memory = ['Ooh, a memory. Was it a sad one? Tell me it was a sad one.', 'You went all still. I thought you were dying. I got so excited.', 'Remembering things is how it starts, you know. Then you have something to lose.'];
  G.FAIRY.named = [['Misery', 'Corin. Ugh. It suits you. All soft at the edges.'], ['Misery', '...Do not look at me like that. I am not remembering anything. I do not have anything to remember.'], ['Misery', 'Mercy was someone else.']];

  // Where they are shaken loose.
  G.LEVELS[0].memoryRest = 'mill';
  G.LEVELS[5].lore[2].memory = 'muster';
  G.LEVELS[6].boss.memory = 'blessing';
  G.LEVELS[7].boss.memory = 'letter';
  G.LEVELS[8].boss.memory = 'sun';

  // With the name back, the end of the road speaks differently.
  const cath = G.LEVELS[4];
  cath.boss.introNamed = [
    ['Ser Garrick', 'Corin. ...You have it back. Look at you, wearing it like a stolen coat.'],
    ['Ser Garrick', 'She called for you by that name until her voice ran red. I answered to it instead. Every night. I am the one who stayed.'],
    ['Ser Garrick', 'I know what you carry. I know what it does to her. I swore to keep this door, Corin, and unlike you, I keep my oaths.'],
  ];
  const ys = cath.npcs.find(n => n.id === 'ysolde');
  ys.linesNamed = [
    ['Ysolde', 'There you are. You are late. I had supper waiting for... oh. For a long time.'],
    ['Knight', 'Ysolde.'],
    ['Ysolde', '...Say the other one. Please. I have said it every night for seven years, and nobody ever said it back.'],
    ['Knight', 'Corin. My name is Corin.'],
    ['Ysolde', 'Corin. Yes. There. Now there are two of us who remember it, and I can stop.'],
    ['Ysolde', 'It is me, brother. I am the well the infection is drawn from. If you give me the Tear, it burns out of every one of them at once — and out of me, and I am mostly made of it now.'],
    ['Ysolde', 'Or throw it away, and stay with me.'],
    ['Ysolde', 'Or... no. Do not do that. I can see you thinking it. Wells can be moved, Corin. That does not mean you should be one.'],
  ];
  G.FAIRY.choiceNamed = [['Misery', 'Oh, Corin. You are going to do something stupid and noble. I can always tell. Your shoulders go square.']];

  G.STORY.endings.named = {
    title: 'The Well Moved',
    text: [
      'You put the Tear to your own eye.',
      'It does not burn the sickness out. It draws it, the way a cut draws a leech: out of Ysolde, out of Garrick where he lies, out of every red-eyed thing in every road in Morrowmere, and down a long cold thread into you.',
      'Ysolde\'s eyes clear. She is shouting your name. You can hear it this time.',
      'You sit down at the altar where she sat. It is not so bad. It is only very loud, all of them at once, and then quieter, and then you are the only one left weeping in all of Morrowmere.',
      '"Go home," you tell her. "Line up the stones."',
    ],
    mercy: [
      'Something small and lavender lands on your knee. You expect her to laugh.',
      'She does not. She sits, chin on her hands, and stays.\n\n"Nobody goes alone," says Mercy. "That was the rule. I forgot it for four hundred years. It is a stupid rule."\n\nShe does not leave.',
    ],
    misery: [
      'On your pauldron, Misery leans in close, delighted.\n\n"There," she whispers. "Now I get to watch you forever."',
    ],
  };

  // ---------------------------------------------------------------------------
  // Mercy at the end of a fight. A broken boss can be spared instead of executed.
  // 'yield': they stop, and go. 'enrage': the humiliation is more than they can bear,
  // and they get up again, faster and harder, and cannot be spared a second time.
  // ---------------------------------------------------------------------------
  const spare = (lv, kind, lines) => { G.LEVELS[lv].boss.spare = { kind, lines }; };
  spare(0, 'enrage', [['Knight', '...'], ['Gaunt', 'You lower your blade? To ME? I hang men. I am not SPARED.'], ['Gaunt', 'Get up, he says. Get up and be pitied. No. Get up and be FED TO THE ROPE!']]);
  spare(2, 'enrage', [['The Drowned Matron', 'You would leave me... with them? Crying in the water? Every night?'], ['The Drowned Matron', 'No. NO. If you will not end it, then I will end YOU, and we will all cry together.']]);
  spare(5, 'yield', [['Knight', 'Stand down, brother.'], ['The Standard-Bearer', '...Stand down. Is that an order?'], ['Knight', 'It is.'], ['The Standard-Bearer', 'Then I am relieved.'], ['The Standard-Bearer', 'He lays the colours across the deck, very carefully, and walks down into the sea.']]);
  spare(6, 'enrage', [['Malvern', 'Pity. From a nameless sword. From a NUMBER.'], ['Malvern', 'I did not ask for mercy. I gave none. I will not be the only one in this vault who received it. KNEEL!']]);
  spare(7, 'yield', [['Abbess Severine', '...You would let me go? Unwashed?'], ['Knight', 'Wash yourself, Mother.'], ['Abbess Severine', 'Yes. Yes, I think... I think I can do that. It is the ninth hour. I will go to the font.'], ['Abbess Severine', 'Tell Petra she was right not to drink.']]);
  spare(8, 'yield', [['Brother Hask', 'You will not throw me off my own mountain?'], ['Knight', 'Stop blowing, brother.'], ['Brother Hask', '...If I stop, it comes back up.'], ['Knight', 'Then let it. It is not yours to hold.'], ['Brother Hask', 'He unlaces his hobnailed boots, sets them in the snow beside you, and walks up into the white, barefoot.']]);
  spare(G.LEVELS.findIndex(l => l.boss && l.boss.type === 'mothmother'), 'enrage', [['The Lamplight Mother', '...you will not... give Mother the little light?'], ['Misery', 'He will NOT.'], ['The Lamplight Mother', 'Then Mother will TAKE it! Children! CHILDREN! COME TO THE LIGHT!']]);
  spare(4, 'yield', [['Knight', 'Enough, brother.'], ['Ser Garrick', '...You were always the soft one. Even with a sword in your hand.'], ['Ser Garrick', 'Fine. I will not get up again. Not as one of them, and not as her keeper.'], ['Ser Garrick', 'Go on. She is waiting. I will hold the door from the other side, where it cannot be opened.']]);
})();
