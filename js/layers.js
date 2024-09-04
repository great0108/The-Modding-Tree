addLayer("u", {
    name: "upgrade", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "upgrade points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('u', 21)) mult = mult.times(upgradeEffect('u', 21))
        if (hasUpgrade('u', 22)) mult = mult.times(upgradeEffect('u', 22))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for upgrade points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function(){
                        let a = "upgrade"
                        return a
                    }
                ],
                "blank",
                "blank",
                "upgrades",
            ],
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function(){
                        let a = "buyable"
                        return a
                    }
                ],
                "blank",
                "blank",
                "buyables",
            ],
            unlocked() {return (hasUpgrade("u", 25))}
        },
    },
    upgrades: {
        11: {
            title: "Game Start",
            description: "gain 1 point per second.",
            cost: new Decimal(1)
        },
        12: {
            title: "Bonus Point",
            description: "gain another 1 point per second.",
            cost: new Decimal(2),
        },
        13: {
            title: "Double Point",
            description: "point gain is doubled.",
            cost: new Decimal(3),
        },
        14: {
            title: "Experience",
            description: "boost your point gain based on itself.",
            cost: new Decimal(5),
            effect() {
                let value = hasUpgrade('u', 24) ? 0.5 : 0.3
                return player.points.add(1).pow(value)
            },
            effectDisplay() {  // Add formatting to the effect 
                // this.layer == p, this.id == 14
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        15: {
            title: "Upgrade Boost",
            description: "boost your point gain based on upgrade points.",
            cost: new Decimal(10),
            effect() {
                return player[this.layer].points.add(1).pow(0.3)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        21: {
            title: "Boost Upgrade",
            description: "boost your upgrade point gain based on points.",
            cost: new Decimal(20),
            effect() {
                return player.points.add(1).pow(0.1)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        22: {
            title: "More Upgrades",
            description: "boost your upgrade point gain based on upgrade points.",
            cost: new Decimal(50),
            effect() {
                return player[this.layer].points.add(1).pow(0.1)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        23: {
            title: "Fast start",
            description: "boost your point gain until 10000 points.",
            cost: new Decimal(100),
            effect() {
                let effect = new Decimal(10000).div(player.points.add(1)).pow(0.3)
                return Decimal.max(new Decimal(1), effect)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        24: {
            title: "Upgrade Upgrades",
            description: "boost the above upgrade effect.",
            cost: new Decimal(200),
        },
        25: {
            title: "New type Upgrade",
            description: "unlock buyable tab.",
            cost: new Decimal(500),
        }
    },
    buyables: {
        rows: 4,
        cols: 3,
        11: {
            cost(x) { return new Decimal(1).mul(x || getBuyableAmt(this.layer, this.id)) },
            display() { return "Blah" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmt(this.layer, this.id).add(1))
            },
        }
    }
})
