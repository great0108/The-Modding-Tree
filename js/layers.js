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
        if (hasUpgrade('u', 25)) {
            mult = mult.times(buyableEffect("u", 13)) 
            mult = mult.times(buyableEffect("u", 14))  
        }
        if (getClickableState('u', 11)) mult = mult.times(clickableEffect('u', 11))
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
                "upgrades"
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
        "Selection": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function(){
                        let a = "selection"
                        return a
                    }
                ],
                "blank",
                "blank",
                "clickables",
            ],
            unlocked() {return (hasUpgrade("u", 35))}
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
                let value = hasUpgrade('u', 24) ? 2 : 1
                return Decimal.log10(player.points.add(1)).add(1).pow(value)
            },
            effectDisplay() {  // Add formatting to the effect 
                // this.layer == p, this.id == 14
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        15: {
            title: "Upgrade Boost",
            description: "upgrade points boost your point gain.",
            cost: new Decimal(10),
            effect() {
                return Decimal.log10(player[this.layer].points.add(1)).add(1)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        21: {
            title: "Boost Upgrade",
            description: "points boost your upgrade point gain.",
            cost: new Decimal(20),
            effect() {
                return Decimal.log10(player.points.add(1)).times(0.5).add(1)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        22: {
            title: "More Upgrades",
            description: "boost your upgrade point gain based on itself.",
            cost: new Decimal(50),
            effect() {
                return Decimal.log10(player[this.layer].points.add(1)).times(0.5).add(1)
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
                let effect = new Decimal(10000).div(Decimal.max(new Decimal(10), player.points.add(1))).pow(0.3)
                return Decimal.max(new Decimal(1), effect)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        24: {
            title: "Upgrade Upgrades",
            description: "boost the above upgrade effect.",
            cost: new Decimal(300),
        },
        25: {
            title: "New type Upgrade!",
            description: "unlock buyable tab.",
            cost: new Decimal(500),
        },
        31: {
            title: "Point Squared",
            description: "base point gain is squared.",
            cost: new Decimal(2e4),
            unlocked() {
                return hasUpgrade(this.layer, 25)
            }
        },
        32: {
            title: "Buyable Boost",
            description: "first buyable also multiply your point gain.",
            cost: new Decimal(3e5),
            unlocked() {
                return hasUpgrade(this.layer, 25)
            },
            effect() {
                return getBuyableAmount(this.layer, 11)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        33: {
            title: "Need More Buyable",
            description: "unlock two new buyables.",
            cost: new Decimal(1e7),
            unlocked() {
                return hasUpgrade(this.layer, 25)
            }
        },
        34: {
            title: "Buyable Power",
            description: "boost second buyable effect.",
            cost: new Decimal(1e10),
            unlocked() {
                return hasUpgrade(this.layer, 25)
            }
        },
        35: {
            title: "New type Upgrade Again!",
            description: "unlock selection tab.",
            cost: new Decimal(1e15),
            unlocked() {
                return hasUpgrade(this.layer, 25)
            }
        }
    },
    buyables: {
        rows: 3,
        cols: 4,
        11: {
            title: "Add Point",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let cost = new Decimal(10000).mul(new Decimal(4).pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                return value
            },
            display() { 
                return "gain additional 1 point\n" +
                 "currently: +" + format(buyableEffect("u", 11)) + "\n\n" +
                 "cost: " + format(this.cost()) + " points"
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Multiple Point",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(3).add(x)
                let cost = new Decimal(10000).mul(value.pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let base = hasUpgrade(this.layer, 34) ? 3 : 2
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                return new Decimal(base).pow(value)
            },
            display() { 
                let base = hasUpgrade(this.layer, 34) ? "triple" : "double"
                return base + " point gain\n" +
                 "currently: " + format(buyableEffect("u", 12)) + "x" + "\n\n" +
                 "cost: " + format(this.cost()) + " points"
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            title: "Multiple Upgrade Point",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(1).add(x).pow(2)
                let cost = new Decimal(1000).mul(value.pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                return new Decimal(2).pow(value)
            },
            display() { 
                return "double upgrade point gain\n" +
                 "currently: " + format(buyableEffect("u", 13)) + "x" + "\n\n" +
                 "cost: " + format(this.cost()) + " upgrade points"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        14: {
            title: "Devide Cost",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(4).add(x)
                let cost = new Decimal(1000).mul(value.pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                return new Decimal(2).pow(value.times(this.layer.exponent))
            },
            display() {
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                let effect = new Decimal(2).pow(value)
                return "half the cost for upgrade points\n" +
                 "currently: /" + format(effect) + "\n\n" +
                 "cost: " + format(this.cost()) + " upgrade points"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        21: {
            title: "Add First Row",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(3).pow(x)
                let cost = new Decimal(1e7).mul(value.pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                return getBuyableAmount(this.layer, this.id)
            },
            display() { 
                return "add one buyable to the first row\n" +
                 "currently: +" + format(buyableEffect(this.layer, 21)) + "\n\n" +
                 "cost: " + format(this.cost()) + " upgrade points"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 33)
            }
        },
        22: {
            title: "Devide Buyable Cost",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(5).add(x).pow(2)
                let cost = new Decimal(1e7).mul(value.pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                return new Decimal(2).pow(getBuyableAmount(this.layer, this.id))
            },
            display() { 
                return "half the buyable cost\n" +
                 "currently: /" + format(buyableEffect(this.layer, 22)) + "\n\n" +
                 "cost: " + format(this.cost()) + " upgrade points"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 33)
            }
        }
    },
    clickables : {
        rows: 10,
        cols: 3,
        11: {
            title: "First",
            effect() {
                return new Decimal(2)
            },
            display() { 
                return "first"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 11) ||
                   getClickableState(this.layer, 12) ||
                   getClickableState(this.layer, 13)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
            }
        },
        12: {
            title: "Second",
            effect() {
                return new Decimal(2)
            },
            display() { 
                return "second"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 11) ||
                   getClickableState(this.layer, 12) ||
                   getClickableState(this.layer, 13)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
            }
        },
        13: {
            title: "Third",
            effect() {
                return new Decimal(2)
            },
            display() { 
                return "third"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 11) ||
                   getClickableState(this.layer, 12) ||
                   getClickableState(this.layer, 13)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
            }
        }
    }
})
