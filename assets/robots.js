
function makeApp(app) {
	// ~~~~~~~~~~~~~  SPLASH  ~~~~~~~~~~~~~
	STYLE = {displayClose:false, backdropClose:false, backdropColor:black.toAlpha(.5), once:true};
	const pane = new Page(500,155,lighter).center(app).mov(0,-55);
	new Pic("logo.jpg")
		.scaleTo(pane, 90)
		.center(pane)
		.mov(-3)
		.ble();

	const settingsSound = new Aud("phaser");
	const settingsCloseSound = new Aud("breakdown");
	const paneSound = new Aud("voice");
	const waitSound = new Aud("electric");
	const closeSound = new Aud("hit");
	const restartSound = new Aud("vocal");
	const endSound = new Aud("thankyou");
	const yesSound = new Aud("yesdeep");
	const noSound = new Aud("no");
	const awardSound = new Aud("confirm")

	orange = "#f24729"; // adjust the orange and blue colors to match those from our logo made in photoshop
	blue = "#00c7bb";
	brown = "#87572a";
	


	// ~~~~~~~~~~~~~  HEADER  ~~~~~~~~~~~~~
	new Pic("logo.jpg").scaleTo(app,88).pos(-3,12,CENTER,TOP,app);


	// // ~~~~~~~~~~~~~  FOOTER  ~~~~~~~~~~~~~
	const settings = new Button({
		width:65,
		height:65,
		bgColor:brown,
		icon:makeIcon("menu", white)
	}).expand().tap(()=>{
		if (soundCheck) settingsSound.play();
		settingsPane.show().mov(0,200);
	})
	STYLE = {shiftV:4};
	const instruct = new Label("Find 1 Evil", 45, "nova", yellow);
	const right = new Label({text:0, font:"nova", align:RIGHT, color:blue, size:30}).reg(RIGHT,TOP);
	const wrong = new Label({text:0, font:"nova", align:RIGHT, color:orange, size:30}).reg(RIGHT,TOP);

	STYLE = {align:CENTER, valign:CENTER};
	const scoreTile = new Tile([
		makeIcon("checkmark", blue).sca(.8), right,
		makeIcon("close", orange).sca(.7), wrong
	],2,2,30,10,true);
	const footer = new Tile([settings, instruct, scoreTile], 3, 1, 70, 0, true).scaleTo(app, 85).pos(0,16,CENTER,BOTTOM,app);
	STYLE = {}




	// ~~~~~~~~~~~~~  DATA  ~~~~~~~~~~~~~
	// there are 100 robots in the good spritesheet and 100 robots in the evil spritesheet
	// the shuffled series will prepare for how we randomly tell the sprite which frame to go to
	const goodSeries = series({min:0, max:99}).shuffle();
	const evilSeries = series({min:0, max:99}).shuffle();

	const good = new Pic("good2.jpg");
	const evil = new Pic("evil2.jpg");

	let set;
	const total = 15;
	let level = 0;
	let answer;
	let num;
	let rightCount;
	let wrongCount;

	function makeSet() {
		set = [];
		rightCount = 0;
		wrongCount = 0;
		if (level <= Math.floor(total/2)) {
			answer = false; // looking for not good
			num = level;
			instruct.text = "Find " + num + " Evil";
		} else {
			answer = true; // looking for good
			num = total-level;
			instruct.text = "Find " + num + " Good";
		}        
		loop(total-level, i=>{
			let sprite = new Sprite({image:good, cols:10, rows:10, spacingX:0, spacingY:0}).reg(CENTER)
			sprite.frame = goodSeries();
			sprite.good = true;
			set.push(sprite);
		});
		loop(level, i=>{
			let sprite = new Sprite({image:evil, cols:10, rows:10, spacingX:0, spacingY:0}).reg(CENTER)
			sprite.frame = evilSeries();
			sprite.good = false;
			set.push(sprite)
		});
		shuffle(set);
	}

	const marks = new Container(app.width,app.height).addTo(app);


	// ~~~~~~~~~~~~~  ROBOTS  ~~~~~~~~~~~~~
	let robots;
	function doRobots(bots) {
		marks.disposeAllChildren();
		if (robots) robots.dispose();  
		level++;                          
		makeSet();
		robots = new Tile(set, 3, 5, 10, 10, true)
			.scaleTo(app, 95)
			.center(app)
			.bot()
			.ord(1)
			.tap(doTap);
		if (bots) {
			robots
				.alp(0)
				.noMouse()
				.cache()
				.animate({
					props:{alpha:1},
					time:1.5,
					call:()=>{
						robots.mouse();
						pane.removeFrom();
						robots.uncache();
						marks.alp(1);
					}
				});
		}
			
	} 
	doRobots();


	// ~~~~~~~~~~~~~  INTERACTION  ~~~~~~~~~~~~~
	function doTap(e) {
		if (e.target.type == "Sprite") {
			new Rectangle(e.target.width*robots.scale, e.target.height*robots.scale,black).reg(CENTER).alp(.6).loc(e.target, null, marks)
			if (e.target.good == answer) {
				makeIcon("checkmark", blue).sca(3).loc(e.target, null, marks);
				right.text = Number(right.text) + 1;
				rightCount++;                    
				if (rightCount == num) {                        
					if (level == (Math.floor(total/2))) {
						if (soundCheck) endSound.play()
						robots.noMouse();
						settings.noMouse(); 
						robots.animate({
							wait:.5,
							props:{alpha:0},
							time:2.2,
							call:()=>{settings.mouse();}
						});
						marks.animate({
							wait:.5,
							props:{alpha:0},
							time:2.5
						})                           
						timeout(.5, ()=>{
							robots.cache();
							end();
						});
						return;
					}
					if (soundCheck) yesSound.play()
					timeout(.5, ()=>{
						if (soundCheck) awardSound.play()
					});                        
					next();
				} else {
					if (soundCheck) yesSound.play()
				}
			} else {
				makeIcon("close", orange).sca(3).loc(e.target, null, marks);
				wrong.text = Number(wrong.text) + 1;
				wrongCount++;
				if (soundCheck) noSound.play()
			}
			e.target.noMouse();
			S.update();
		}
	}       

	function next() {
		robots.noMouse(); 
		timeout(.5, ()=>{
			robots.cache();
			timeout(.1, ()=>{
				if (soundCheck) paneSound.play();
			})
			timeout(1.3, ()=>{
				if (soundCheck) waitSound.play();
			})
			timeout(2.4, ()=>{
				if (soundCheck) closeSound.play();
			})
			pane.addTo(app);
		});
		robots.animate({
			wait:.5,
			props:{alpha:0},
			time:2.2,
			call:doRobots // will pass a target parameter to doRobots
		});
		marks.animate({
			wait:.5,
			props:{alpha:0},
			time:2.5
		});
	}


	// ~~~~~~~~~~~~~  LINES  ~~~~~~~~~~~~~
	function makeLines(length, thickness, spacing, color) {
		let obj = {length, thickness, color};
		let con = new Container(length,spacing); // lines have no height according to pos
		new Line(obj).pos(0,0,LEFT,TOP,con);
		new Line(obj).pos(0,0,LEFT,BOTTOM,con);
		return con;
	}
	makeLines(app.width, 1, 3, light).alp(.5).loc(0, robots.y-12, app);
	makeLines(app.width, 1, 3, light).alp(.5).loc(0, robots.y+robots.height+14, app);

	// // ~~~~~~~~~~~~~  END  ~~~~~~~~~~~~~
	const endPane = new Pane({
		content:" ",
		width:app.width*1.2,
		height:410,
		bgColor:yellow,
		backdropColor:black.toAlpha(.8),
		container:app
	});
	makeLines(endPane.width, 1, 5, black).pos(0, 5, LEFT,TOP, endPane);
	makeLines(endPane.width, 1, 5, black).pos(0, 5, LEFT,BOTTOM, endPane);
	const leaderBoard = new Pic("leaderboard.png").sca(.9).tap(()=>{
		if (soundCheck) new Aud("vocal").play()
		zgo("https://zimjs.com/board/", "_blank"); 
	});
	const account = new Pic("zappstore_account.png").sca(1).tap(()=>{
		// localStorage.zim_id = "test";        
		zgo("https://zimjs.com/account.html", "_blank"); 
	});
	const plasmapoints = new Pic("plasmapoints_10.png").scaleTo(app, 100).tap(()=>{           
		if (soundCheck) new Aud("lock").play()
		// localStorage.robot_reward = 1;
		zgo("https://zimjs.com/points/", "_blank"); 
	});
	STYLE = {align:CENTER, text:"", font:"nova", align:CENTER};
	const winMessage = new Label({align:CENTER, text:"", font:"nova", align:CENTER})
		.cur()
		.expand()
		.tap(()=>{
			zgo("https://zimjs.com/board/", "_blank");
		});

	let paneEvent;
	function end() {
		timeout(.5, ()=>{
			if (soundCheck) new Aud("bass").play()
		});        
		endPane.contentContainer.removeAllChildren();
		if (!loggedIn) {
			winMessage.text = "Login to record score";
			account.centerReg(endPane.contentContainer).mov(0,-35);
			winMessage.centerReg(endPane.contentContainer).mov(0,105);
			endPane.contentContainer.cur().expand().on("mousedown", ()=>{
				zgo("https://zimjs.com/account.html", "_blank"); 
			})
			endPane.show(testLogin);
			// timeout(2, ()=>{endPane.hide()})
		} else if (!reward) {
			winMessage.text = "Unlock more levels\n\nwith Plasma Points";
			winMessage.centerReg(endPane.contentContainer).mov(0,120);                
			new Rectangle(W,200,black).centerReg(endPane.contentContainer).mov(0,-60);
			plasmapoints.centerReg(endPane.contentContainer).mov(0,-60);
			if (paneEvent) endPane.contentContainer.removeAllEventListeners();
			paneEvent = endPane.contentContainer.cur().expand().on("mousedown", ()=>{
				zgo("https://zimjs.com/points/", "_blank");
			})
			endPane.show(testReward);
		} else {
			showScore();
		}
	}

	function showScore() {
		let currentScore = Number(right.text) - Number(wrong.text);
		if (currentScore > currentBest) {
			currentBest = currentScore;
			if (loggedIn) async("https://zimjs.com/robots/data.php?command=setScore&score="+currentScore+"&t="+Date.epoch(), doData);
		}
		let added = "";
		if (!reward) added = "Half ";
		winMessage.text = added + "Complete...\n\nYour Score is: " + currentScore + "\n\nYour Best is: " + currentBest;
		winMessage.centerReg(endPane.contentContainer).mov(0,-80);
		leaderBoard.centerReg(endPane.contentContainer).mov(0,93);
		if (paneEvent) endPane.contentContainer.removeAllEventListeners();           
		endPane.show(restart);
	}

	function testLogin() {
		if (loggedIn) end();
		else restart();
	}

	function testReward() {
		if (reward == 0) {
			endPane.contentContainer.removeAllChildren();
			showScore();
		}
		else next();
	}

	// timeout(3, end);


	// ~~~~~~~~~~~~~  SETTINGS  ~~~~~~~~~~~~~
	STYLE = {font:"nova"}
	let soundCheck = true;
	const settingsList = new List({
		width:400,
		height:300,
		list:["RESTART", "ACCOUNT", "MUTE"],
		viewNum:3,
		currentSelected:false,
		color:white.toAlpha(.8),
		bgColor:brown,
		rollBgColor:brown.lighten(.2),
		slide:false,
		scrollBarActive:false,
		borderColor:clear,
		backdropColor:black,
		labelAlign:LEFT,
		labelValign:TOP,
		labelIndentH:140,
		labelIndentV:36,
	}).tap(()=>{
		if (settingsList.text == "RESTART") restart();
		else if (settingsList.text == "ACCOUNT") {
			zgo("https://zimjs.com/account.html", "_blank");
			if (soundCheck) restartSound.play();
		}
		else if (settingsList.text == "MUTE") {
			soundCheck = false;
			settingsList.items[2].label.text = "SOUND";
			i3.alp(0);
			i4.alp(1);
			animate(backingSound, {volume:0}, 2);
		} else if (settingsList.text == "SOUND") {
			soundCheck = true;
			settingsList.items[2].label.text = "MUTE";
			i3.alp(1);
			i4.alp(0);
			animate(backingSound, {volume:.5}, 2);
		}
		timeout(1, ()=>{
			settingsPane.hide();   
		});                    
	});
	Style.add({alpha:.9});
	const i1 = makeIcon("rotate", white).sca(-1,1).pos(55,0,LEFT,CENTER,settingsList.items[0])
	const i2 = makeIcon("settings", white).pos(55,0,LEFT,CENTER,settingsList.items[1])
	const i3 = makeIcon("sound", white).sca(1.2).pos(60,0,LEFT,CENTER,settingsList.items[2])
	const i4 = makeIcon("mute", white).sca(1.2).pos(60,0,LEFT,CENTER,settingsList.items[2]).alp(0);
	const r = new Rectangle(i2.width*1.5,i2.height*1.4,clear,white,3,8).reg(CENTER).loc(i1,null,settingsList.items[0]).ord(-1);
	r.clone().loc(i2,null,settingsList.items[1]).ord(-1);
	r.clone().loc(i3,null,settingsList.items[2]).ord(-1);
	STYLE = {};
	const settingsPane = new Pane({
		width:settingsList.width,
		height:settingsList.height,
		bgColor:clear,
		backdropColor:black.toAlpha(.8),
		displayClose:false,
		content:settingsList,
		container:app
	});
	settingsPane.backdrop.setBounds(0,0,app.width,app.height).siz(app.width-90,app.height-90);
	settingsPane.backdrop.corner = 50;
	// settingsPane.backdrop.siz().reg(0,0,true); // .setMask(app.backing)
	settingsPane.on("close", ()=>{
		if (soundCheck) settingsCloseSound.play()
	})


	function restart() {
		if (soundCheck) new Aud("robot").play()
		level=0;
		right.text = wrong.text = 0;
		robots.noMouse(); 
		robots.cache();
		robots.animate({
			props:{alpha:0},
			time:.5,
			call:doRobots
		});
		marks.animate({
			props:{alpha:0},
			time:.5
		});
	}

	// ~~~~~~~~~~~~~  STARTING  ~~~~~~~~~~~~~
	const blinder = new Rectangle(app.width,app.height,black,null,null,[0,0,60,60]).addTo(app);

	let backingSound = new Aud("backing.mp3", .5, true);
	pane.top().cur().on("mousedown", ()=>{
		pane.removeFrom();
		backingSound = backingSound.play();
		new Aud("breakdown").play();
		pane.cur("default");
		blinder.animate({
			props:{alpha:0},
			time:2,
			call:()=>{blinder.dispose();}
		});
	}, null, true); // true for remove this event once it runs
}