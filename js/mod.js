let modInfo = {
	name: "The mechanic Tree",
	id: "mechanicTree",
	author: "great",
	pointsName: "points",
	modFiles: ["layers/upgrade.js", "layers/prestige.js", "layers/generator.js", "layers/info.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2.1",
	name: "Color area",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.1</h3><br>
		- Added Upgrade Layer.<br>
		- Added Upgrades.<br>
		- Added Buyables.<br>
		- Added Selection.<br>
		- Added Tree Upgrades.<br>
		<br>	

	<h3>v0.2</h3><br>
		- Added Prestige Layer.<br>
		- Added Prestige Upgrades.<br>
		- Added Prestige Milestones.<br>
		- Added Spell.<br>
		- Added Info Layer.<br>
		- Rebalance Upgrade layer.<br>
		- Added 4 Upgrades.<br>
		- Added 2 selection row.<br>
		<br>

	<h3>v0.2.1</h3><br>
	    - Added Color.<br>
		- Added Color Upgrades.<br>
		- Added 2 Prestige Upgrades.<br>
		- Added 1 Upgrade.<br>
		- Upgrade Bug fix.<br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0)
	if (hasUpgrade('u', 11)) gain = gain.plus(1)
	if (hasUpgrade('u', 12)) gain = gain.plus(1)
	if (hasUpgrade('u', 25)) gain = gain.plus(buyableEffect("u", 11)) 

	if (hasUpgrade('u', 31)) gain = gain.pow(2)

	if (hasUpgrade('u', 13)) gain = gain.times(2)
	if (hasUpgrade('u', 14)) gain = gain.times(upgradeEffect('u', 14))
	if (hasUpgrade('u', 15)) gain = gain.times(upgradeEffect('u', 15))
	if (hasUpgrade('u', 23)) gain = gain.times(upgradeEffect('u', 23))
	if (hasUpgrade('u', 25)) gain = gain.times(buyableEffect("u", 12))
	if (hasUpgrade('u', 32)) gain = gain.times(upgradeEffect("u", 32)) 

	if (getClickableState("u", 11)) gain = gain.times(clickableEffect("u", 11))
	if (getClickableState('u', 31)) gain = gain.times(clickableEffect('u', 31))
	if (getClickableState('u', 32)) gain = gain.times(clickableEffect('u', 32))
	if (getClickableState('u', 33)) gain = gain.times(clickableEffect('u', 33))
	if (hasUpgrade('u', 41)) gain = gain.times(upgradeEffect("u", 41)) 

	if (hasUpgrade('u', 1031)) gain = gain.times(upgradeEffect("u", 1031))
	if (hasUpgrade('u', 1061)) gain = gain.times(upgradeEffect('u', 1061))

	if (player["p"].unlocked) gain = gain.mul(layers["p"].effect())
	if (hasUpgrade("p", 15)) gain = gain.mul(clickableEffect("p", 11))
	if (hasUpgrade("p", 23)) gain = gain.mul(layers["p"].yellowEffect())
	if (hasUpgrade('u', 55)) gain = gain.mul(upgradeEffect('u', 55))

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player["g"].unlocked
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}