addLayer("u", {
    name: "upgrade", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        clickablesUnlock: [],
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
        if (getClickableState('u', 12)) mult = mult.times(clickableEffect('u', 12))
        if (getClickableState('u', 33)) mult = mult.times(clickableEffect('u', 33))
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
                "blank",
                ["row", [["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14], ["upgrade", 15]]],
                ["row", [["upgrade", 21], ["upgrade", 22], ["upgrade", 23], ["upgrade", 24], ["upgrade", 25]]],
                ["row", [["upgrade", 31], ["upgrade", 32], ["upgrade", 33], ["upgrade", 34], ["upgrade", 35]]],
                ["row", [["upgrade", 41], ["upgrade", 42], ["upgrade", 43], ["upgrade", 44], ["upgrade", 45]]],
            ],
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
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
                        let a = player[this.layer].clickablesUnlock.length
                        a = Math.floor(a / 3) - 1
                        if (!hasUpgrade("u", 43) && a >= 2) return "all selections are unlocked"
                        if (a in tmp.u.unlockCost) {
                            return "next selection is unlocked at " +
                             format(tmp.u.unlockCost[a]) + " points"
                        }
                        return "all selections are unlocked"
                    }
                ],
                "blank",
                "blank",
                "clickables",
            ],
            unlocked() {return hasUpgrade("u", 35)}
        },
        "Tree" : {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                ["row", [["upgrade", 1011]]],
                ["row", [["upgrade", 1021], ["upgrade", 1022]]],
            ],
            unlocked() {return (hasUpgrade("u", 45))}
        }
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
            description: "boost point gain based on itself.",
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
            description: "upgrade points boost point gain.",
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
            description: "points boost upgrade point gain.",
            cost: new Decimal(20),
            effect() {
                return Decimal.log10(player.points.add(1)).add(1).pow(0.8)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        22: {
            title: "More Upgrades",
            description: "boost upgrade point gain based on itself.",
            cost: new Decimal(50),
            effect() {
                return Decimal.log10(player[this.layer].points.add(1)).add(1).pow(0.8)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        23: {
            title: "Fast start",
            description: "boost point gain until 10000 points.",
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
            cost: new Decimal(500),
        },
        25: {
            title: "New type Upgrade!",
            description: "unlock buyable tab.",
            cost: new Decimal(1000),
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
                return buyableEffect(this.layer, 11).add(1)
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
            cost: new Decimal(1e13),
            unlocked() {
                return hasUpgrade(this.layer, 25)
            }
        },
        35: {
            title: "New type Upgrade Again!",
            description: "unlock selection tab.",
            cost: new Decimal(1e18),
            unlocked() {
                return hasUpgrade(this.layer, 25)
            }
        },
        41: {
            title: "Counting Selection",
            description: "boost point gain based on unlocked selection number.",
            cost: new Decimal(5e23),
            unlocked() {
                return hasUpgrade(this.layer, 35)
            },
            effect() {
                return new Decimal(player[this.layer].clickablesUnlock.length).add(1)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        42: {
            title: "Buyable Power 2",
            description: "boost fourth buyable effect.",
            cost: new Decimal(2e25),
            unlocked() {
                return hasUpgrade(this.layer, 35)
            },
        },
        43: {
            title: "Need More Selection",
            description: "unlock two new selection.",
            cost: new Decimal(1e33),
            unlocked() {
                return hasUpgrade(this.layer, 35)
            }
        },
        44: {
            title: "Boost Selection",
            description: "boost fourth row selection effect.",
            cost: new Decimal(5e38),
            unlocked() {
                return hasUpgrade(this.layer, 35)
            }
        },
        45: {
            title: "Last type Upgrade!",
            description: "unlock tree tab.",
            cost: new Decimal(2e41),
            unlocked() {
                return hasUpgrade(this.layer, 35)
            }
        },
        1011: {
            title: "first",
            description: "first.",
            cost: new Decimal(2e41),
            unlocked() {
                return hasUpgrade(this.layer, 45)
            },
            branches : [121, 122],
            style: { margin: "10px" }
        },
        1021: {
            title: "left",
            description: "second.",
            cost: new Decimal(2e41),
            unlocked() {
                return hasUpgrade(this.layer, 111)
            },
            style: { margin: "10px" }
        },
        1022: {
            title: "right",
            description: "third.",
            cost: new Decimal(2e41),
            unlocked() {
                return hasUpgrade(this.layer, 111)
            },
            style: { margin: "10px" }
        }
    },
    buyables: {
        rows: 3,
        cols: 4,
        11: {
            title: "Add Point",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let cost = new Decimal(10000).mul(new Decimal(5).pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                if (getClickableState('u', 13)) value = value.times(clickableEffect('u', 13))
                return value
            },
            display() { 
                return "gain additional 1 point\n" +
                 "currently: +" + format(buyableEffect(this.layer, this.id)) + "\n\n" +
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
                let value = new Decimal(4).add(x)
                let cost = new Decimal(10000).mul(value.pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let base = hasUpgrade(this.layer, 34) ? 3 : 2
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                if (getClickableState('u', 21)) value = value.add(clickableEffect('u', 21))
                return new Decimal(base).pow(value)
            },
            display() { 
                let base = hasUpgrade(this.layer, 34) ? "triple" : "double"
                return base + " point gain\n" +
                 "currently: " + format(buyableEffect(this.layer, this.id)) + "x" + "\n\n" +
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
                if (getClickableState('u', 22)) value = value.add(clickableEffect('u', 22))
                return new Decimal(2).pow(value)
            },
            display() { 
                return "double upgrade point gain\n" +
                 "currently: " + format(buyableEffect(this.layer, this.id)) + "x" + "\n\n" +
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
                let value = new Decimal(5).add(x)
                let cost = new Decimal(1000).mul(value.pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let base = hasUpgrade(this.layer, 42) ? 3 : 2
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                if (getClickableState('u', 23)) value = value.add(clickableEffect('u', 23))
                return new Decimal(base).pow(value.times(tmp.u.exponent))
            },
            display() {
                let base = hasUpgrade(this.layer, 34) ? "one-third" : "double"
                let effect = buyableEffect(this.layer, this.id)
                effect = effect.pow(new Decimal(1).div(tmp.u.exponent))
                return base + " the cost for upgrade points\n" +
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
                let value = new Decimal(3).pow(x.add(1))
                let cost = new Decimal(1e7).mul(value.pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                if (getClickableState('u', 31)) value = value.add(clickableEffect('u', 31))
                return value
            },
            display() { 
                return "add one buyable to the first row\n" +
                 "currently: +" + format(buyableEffect(this.layer, this.id)) + "\n\n" +
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
                let value = getBuyableAmount(this.layer, this.id)
                if (getClickableState('u', 32)) value = value.add(clickableEffect('u', 32))
                return new Decimal(2).pow(value)
            },
            display() { 
                return "half the buyable cost\n" +
                 "currently: /" + format(buyableEffect(this.layer, this.id)) + "\n\n" +
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
    unlockCost() {
        return {
            0 : 1e21,
            1 : 1e27,
            2 : 1e29,
            3 : 1e33
        }
    },
    clickables : {
        rows: 10,
        cols: 3,
        11: {
            title: "Replicate Point",
            effect() {
                let value = Decimal.log10(player.points.add(1)).add(1)
                if (getClickableState('u', 41)) value = value.pow(clickableEffect('u', 41))
                return value
            },
            display() { 
                return "point gain is boosted by itself\n" + 
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if (!getClickableState('u', 51)) {
                    if(getClickableState(this.layer, 12) ||
                       getClickableState(this.layer, 13)) return false
                } else {
                    if(getClickableState(this.layer, 12) &&
                       getClickableState(this.layer, 13)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (hasUpgrade("u", 35)) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        12: {
            title: "Replicate Upgrade Point",
            effect() {
                let value = Decimal.log10(player[this.layer].points.add(1)).add(1).pow(0.6)
                if (getClickableState('u', 42)) value = value.pow(clickableEffect('u', 42))
                return value
            },
            display() { 
                return "upgrade point gain is boosted by itself\n" + 
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if (!getClickableState('u', 51)) {
                    if(getClickableState(this.layer, 11) ||
                       getClickableState(this.layer, 13)) return false
                } else {
                    if(getClickableState(this.layer, 11) &&
                       getClickableState(this.layer, 13)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (hasUpgrade("u", 35)) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        13: {
            title: "Replicate Buyable",
            effect() {
                let value = new Decimal(3)
                if (getClickableState('u', 43)) value = value.pow(clickableEffect('u', 43))
                return value
            },
            display() { 
                return "multiply the number of first buyable you have\n" +
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if (!getClickableState('u', 51)) {
                    if(getClickableState(this.layer, 11) ||
                       getClickableState(this.layer, 12)) return false
                } else {
                    if(getClickableState(this.layer, 11) &&
                       getClickableState(this.layer, 12)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (hasUpgrade("u", 35)) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        21: {
            title: "Free Second Buyable",
            effect() {
                let value = Decimal.log10(player.points.add(1)).pow(0.3)
                if (getClickableState('u', 41)) value = value.times(clickableEffect('u', 41))
                return value
            },
            display() { 
                return "gain free second buyables based on points\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id))
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if (!getClickableState('u', 52)) {
                    if(getClickableState(this.layer, 22) ||
                       getClickableState(this.layer, 23)) return false
                } else {
                    if(getClickableState(this.layer, 22) &&
                       getClickableState(this.layer, 23)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[0])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        22: {
            title: "Free Third Buyable",
            effect() {
                let value = getBuyableAmount(this.layer, 22)
                value = Decimal.log10(value.add(1)).times(3)
                if (getClickableState('u', 42)) value = value.times(clickableEffect('u', 42))
                return value
            },
            display() { 
                return "gain free third buyables based on itself\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id))
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if (!getClickableState('u', 52)) {
                    if(getClickableState(this.layer, 21) ||
                       getClickableState(this.layer, 23)) return false
                } else {
                    if(getClickableState(this.layer, 21) &&
                       getClickableState(this.layer, 23)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[0])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        23: {
            title: "Free Fourth Buyable",
            effect() {
                let value = Decimal.log10(player[this.layer].points.add(1)).pow(0.5)
                if (getClickableState('u', 43)) value = value.times(clickableEffect('u', 43))
                return value
            },
            display() { 
                return "gain free fourth buyables based on upgrade points\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id))
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if (!getClickableState('u', 52)) {
                    if(getClickableState(this.layer, 21) ||
                       getClickableState(this.layer, 22)) return false
                } else {
                    if(getClickableState(this.layer, 21) &&
                       getClickableState(this.layer, 22)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[0])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        31: {
            title: "Free fifth Buyable",
            effect() {
                let value = Decimal.log10(player.points.add(1)).pow(0.2).times(0.7)
                if (getClickableState('u', 41)) value = value.times(clickableEffect('u', 41))
                return value
            },
            display() { 
                return "gain free fifth buyables based on points\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id))
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if (!getClickableState('u', 53)) {
                    if(getClickableState(this.layer, 32) ||
                       getClickableState(this.layer, 33)) return false
                } else {
                    if(getClickableState(this.layer, 32) &&
                       getClickableState(this.layer, 33)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[1])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        32: {
            title: "Free sixth Buyable",
            effect() {
                let value = Decimal.log10(player[this.layer].points.add(1)).pow(0.2)
                if (getClickableState('u', 42)) value = value.times(clickableEffect('u', 42))
                return value
            },
            display() { 
                return "gain free sixth buyables based on upgrade points\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id))
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if (!getClickableState('u', 53)) {
                    if(getClickableState(this.layer, 31) ||
                       getClickableState(this.layer, 33)) return false
                } else {
                    if(getClickableState(this.layer, 31) &&
                       getClickableState(this.layer, 33)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[1])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        33: {
            title: "Big Boost",
            effect() {
                let value = new Decimal(5)
                if (getClickableState('u', 43)) value = value.pow(clickableEffect('u', 43))
                return value
            },
            display() { 
                return "Boost point and upgrade point gain\n" + 
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if (!getClickableState('u', 53)) {
                    if(getClickableState(this.layer, 31) ||
                       getClickableState(this.layer, 32)) return false
                } else {
                    if(getClickableState(this.layer, 31) &&
                       getClickableState(this.layer, 32)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[1])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        41: {
            title: "Enhance first column",
            effect() {
                let value = new Decimal(1.5)
                if (hasUpgrade(this.layer, 44)) value = value.add(0.3)
                return value
            },
            display() { 
                return "the above upgrades in first column is stronger\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id).sub(1).times(100)) + "%"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 41) ||
                   getClickableState(this.layer, 42) ||
                   getClickableState(this.layer, 43)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[2])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        42: {
            title: "Enhance second column",
            effect() {
                let value = new Decimal(1.5)
                if (hasUpgrade(this.layer, 44)) value = value.add(0.3)
                return value
            },
            display() { 
                return "the above upgrades in second column is stronger\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id).sub(1).times(100)) + "%"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 41) ||
                   getClickableState(this.layer, 42) ||
                   getClickableState(this.layer, 43)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[2])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        43: {
            title: "Enhance third column",
            effect() {
                let value = new Decimal(1.5)
                if (hasUpgrade(this.layer, 44)) value = value.add(0.3)
                return value
            },
            display() { 
                return "the above upgrades in third column is stronger\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id).sub(1).times(100)) + "%"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 41) ||
                   getClickableState(this.layer, 42) ||
                   getClickableState(this.layer, 43)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[2])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        51: {
            title: "More first selection",
            effect() {
                return new Decimal(1)
            },
            display() { 
                return "one more selection in first row" 
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 51) ||
                   getClickableState(this.layer, 52) ||
                   getClickableState(this.layer, 53)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) {
                    setClickableState(this.layer, 11, false)
                    setClickableState(this.layer, 12, false)
                    setClickableState(this.layer, 13, false)
                    doReset(this.layer)
                }
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[3])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        52: {
            title: "More second selection",
            effect() {
                return new Decimal(1)
            },
            display() { 
                return "one more selection in second row" 
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 51) ||
                   getClickableState(this.layer, 52) ||
                   getClickableState(this.layer, 53)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) {
                    setClickableState(this.layer, 21, false)
                    setClickableState(this.layer, 22, false)
                    setClickableState(this.layer, 23, false)
                    doReset(this.layer)
                }
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[3])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        53: {
            title: "More third selection",
            effect() {
                return new Decimal(1)
            },
            display() { 
                return "one more selection in third row"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 51) ||
                   getClickableState(this.layer, 52) ||
                   getClickableState(this.layer, 53)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) {
                    setClickableState(this.layer, 31, false)
                    setClickableState(this.layer, 32, false)
                    setClickableState(this.layer, 33, false)
                    doReset(this.layer)
                }
            },
            style : {
                "width": "150px"
            },
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player.points.gte(tmp.u.unlockCost[3])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        }
    }
})
