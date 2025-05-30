const BuyableStyle = { margin: "7px" }
const TreeStyle = { margin: "10px" }

function PointBuyMax() {
    if (!this.canAfford()) return
    let x = getBuyableAmount(this.layer, this.id)
    let amount = new Decimal(1)
    while (true) {
        let cost = this.cost(x.add(amount.mul(10)).sub(1))
        if (player.points.lte(cost)) break
        amount = amount.mul(10)
    }

    let cost = this.cost(x.add(amount).sub(1))
    if (player.points.lte(cost)) return
    player.points = player.points.sub(cost)
    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
}
function UpgradePointBuyMax() {
    if (!this.canAfford()) return
    let x = getBuyableAmount(this.layer, this.id)
    let amount = new Decimal(1)
    while (true) {
        let cost = this.cost(x.add(amount.mul(10)).sub(1))
        if (player[this.layer].points.lte(cost)) break
        amount = amount.mul(10)
    }

    let cost = this.cost(x.add(amount).sub(1))
    if (player[this.layer].points.lte(cost)) return
    player[this.layer].points = player[this.layer].points.sub(cost)
    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
}

function SelectionStyle() {
    let css = { width: "150px" }
    if (getClickableState(this.layer, this.id)) css["background"] = "#33FF99"
    else if (this.canClick(this.layer, this.id)) css["background"] = "#4BDC13"
    return css
}

function TreeAffold() {
    for (let a of this.req) if (!hasUpgrade(this.layer, a)) return false
    return player[this.layer].treePoint.gte(tmp.u.upgrades[this.id].cost) 
}
function TreeMultiAffold() {
    for (let req of this.req) {
        let check = true
        for (let a of req) {
            if (!hasUpgrade(this.layer, a)) check = false
        }
        if (check) {
            return player[this.layer].treePoint.gte(tmp.u.upgrades[this.id].cost) 
        }
    }
    return false
}
function TreePay() {
    let cost = tmp.u.upgrades[this.id].cost
    player[this.layer].treePoint = player[this.layer].treePoint.sub(cost) 
    player[this.layer].treePointSpent = player[this.layer].treePointSpent.add(cost) 
}
function TreeUnlock(ids) {
    function a() {
        if (player[this.layer].treeUnlock.includes(this.id)) return true
        if (ids.some(id => hasUpgrade(this.layer, id))) {
            player[this.layer].treeUnlock.push(this.id)
            return true
        }
        return false
    }
    return a
}


addLayer("u", {
    name: "upgrade", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        clickablesUnlock: [],
        treePoint: new Decimal(0),
        treePointSpent : new Decimal(0),
        treeUnlock : [],
        resetSelectionRows : [],
        autoBuyable : false
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
        if (hasUpgrade('u', 1032)) mult = mult.times(upgradeEffect('u', 1032))
        if (hasUpgrade('u', 1061)) mult = mult.times(upgradeEffect('u', 1061))

        if (player["p"].unlocked) mult = mult.mul(layers["p"].effect())
        if(getClickableState("u", 62)) mult = mult.mul(clickableEffect("u", 62))
        if (hasUpgrade("p", 15)) mult = mult.mul(clickableEffect("p", 12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for upgrade points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(prestige) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[prestige].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []
        if (hasMilestone("p", 1)) {
            for(let i = 1; i <= 5; i++) {
                for(let j = 1; j <= 5; j++) {
                    let id = i * 10 + j
                    if (hasUpgrade("u", id)) keptUpgrades.push(id)
                }
            }
        }

        if (hasMilestone("p", 4)) {
            for(let id of player["u"].upgrades) {
                if(Number(id) > 1000 && hasUpgrade("u", id)) keptUpgrades.push(id)
            }
        }

        let keptBuyables = {}
        if (hasMilestone("p", 4)) {
            keptBuyables[111] = player["u"].buyables[111]
            keptBuyables[112] = player["u"].buyables[112]
        }
      
        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = ["treeUnlock"];
        if (hasMilestone("p", 2)) keep.push("autoBuyable")
        if (hasMilestone("p", 3)) keep.push("clickables")
        if (hasMilestone("p", 4)) {
            keep.push("treePoint")
            keep.push("treePointSpent")
        }
      
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
      
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades)
        Object.assign(player[this.layer].buyables, keptBuyables)

        if (!hasMilestone("p", 3)) player[this.layer].clickablesUnlock = []
    },
    update(diff) {
        if (player["u"].autoBuyable && hasMilestone("p", 2)) {
            let ids = [11, 12, 13, 14, 21, 22]
            for(let id of ids) {
                this.buyables[id].buyMax()
            }
        }
    },
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
                ["row", [["upgrade", 51], ["upgrade", 52], ["upgrade", 53], ["upgrade", 54], ["upgrade", 55]]]
            ],
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                ["row", [["buyable", 11], ["buyable", 12], ["buyable", 13], ["buyable", 14]]],
                ["row", [["buyable", 21], ["buyable", 22]]]
            ],
            unlocked() {
                return hasUpgrade("u", 25)
            }
        },
        "Selection": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-test", "changing selection upgrade makes upgrade layer reset"],
                "blank",
                ["display-text",
                    function(){
                        let a = player[this.layer].clickablesUnlock.length
                        a = Math.floor(a / 3) - 1
                        if (!hasUpgrade("u", 43) && a >= 2) return "all selections are unlocked"
                        if (!hasUpgrade("u", 52) && a >= 4) return "all selections are unlocked"
                        if (a in tmp.u.unlockCost) {
                            return "next selection is unlocked at " +
                             format(tmp.u.unlockCost[a]) + " upgrade points"
                        }
                        return "all selections are unlocked"
                    }
                ],
                "blank",
                "blank",
                "clickables",
            ],
            unlocked() {
                return hasUpgrade("u", 35)
            }
        },
        "Tree" : {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                ["display-text",
                    function(){
                        let a = player[this.layer].treePoint
                        return a + " tree point"
                    }
                ],
                "blank",
                ["row", [["buyable", 111], ["buyable", 112]]],
                "blank",
                "blank",
                "respec-button",
                "blank",
                ["row", [["upgrade", 1011]]],
                ["row", [["upgrade", 1021], ["upgrade", 1022]]],
                ["row", [["upgrade", 1031], ["upgrade", 1032]]],
                ["row", [["upgrade", 1041], ["upgrade", 1042], ["upgrade", 1043]]],
                ["row", [["upgrade", 1051], ["upgrade", 1052], ["upgrade", 1053]]],
                ["row", [["upgrade", 1061]]],
                ["row", [["upgrade", 1071]]],
            ],
            unlocked() {
                return hasUpgrade("u", 45)
            }
        }
    },
    upgrades: {
        11: {
            title: "Game Start",
            description: "Gain 1 point per second.",
            cost: new Decimal(1)
        },
        12: {
            title: "Bonus Point",
            description: "Gain another 1 point per second.",
            cost: new Decimal(2),
        },
        13: {
            title: "Double Point",
            description: "Point gain is doubled.",
            cost: new Decimal(3),
        },
        14: {
            title: "Self Synergy",
            description: "Boost point gain based on itself.",
            cost: new Decimal(5),
            effect() {
                let value = hasUpgrade('u', 24) ? 2 : 1
                value = Decimal.log10(player.points.add(1)).add(1).pow(value)
                if(hasUpgrade("u", 1021)) value = value.mul(upgradeEffect("u", 1021))
                return value
            },
            effectDisplay() {
                // this.layer == u, this.id == 14
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        15: {
            title: "Upgrade Boost",
            description: "Upgrade points boost point gain.",
            cost: new Decimal(10),
            effect() {
                return Decimal.log10(player[this.layer].points.add(1)).add(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        21: {
            title: "Boost Upgrade",
            description: "Points boost upgrade point gain.",
            cost: new Decimal(20),
            effect() {
                return Decimal.log10(player.points.add(1)).add(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        22: {
            title: "More Upgrades",
            description: "Boost upgrade point gain based on itself.",
            cost: new Decimal(50),
            effect() {
                let value = Decimal.log10(player[this.layer].points.add(1)).add(1).pow(0.9)
                if(hasUpgrade("u", 1022)) value = value.mul(upgradeEffect("u", 1022))
                return value
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        23: {
            title: "Fast start",
            description: "Boost point gain until 10000 points.",
            cost: new Decimal(100),
            effect() {
                let effect = new Decimal(10000).div(Decimal.max(new Decimal(10), player.points.add(1))).pow(0.3)
                return Decimal.max(new Decimal(1), effect)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        24: {
            title: "Upgrade Upgrades",
            description: "Boost the above upgrade effect.",
            cost: new Decimal(500),
        },
        25: {
            title: "New type Upgrade!",
            description: "Unlock buyable tab.",
            cost: new Decimal(1000),
        },
        31: {
            title: "Point Squared",
            description: "Base point gain is squared.",
            cost: new Decimal(2e4),
            unlocked() {
                return hasUpgrade(this.layer, 25) || player["p"].unlocked
            }
        },
        32: {
            title: "Buyable Boost",
            description: "First buyable also multiply your point gain.",
            cost: new Decimal(5e5),
            unlocked() {
                return hasUpgrade(this.layer, 25) || player["p"].unlocked
            },
            effect() {
                return buyableEffect(this.layer, 11).add(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        33: {
            title: "Need More Buyable",
            description: "Unlock two new buyables.",
            cost: new Decimal(1e7),
            unlocked() {
                return hasUpgrade(this.layer, 25) || player["p"].unlocked
            }
        },
        34: {
            title: "Buyable Power",
            description: "Boost second buyable effect.",
            cost: new Decimal(1e13),
            unlocked() {
                return hasUpgrade(this.layer, 25) || player["p"].unlocked
            }
        },
        35: {
            title: "New type Upgrade Again!",
            description: "Unlock selection tab.",
            cost: new Decimal(1e18),
            unlocked() {
                return hasUpgrade(this.layer, 25) || player["p"].unlocked
            }
        },
        41: {
            title: "Counting Selection",
            description: "Boost point gain based on unlocked selection number.",
            cost: new Decimal(1e22),
            unlocked() {
                return hasUpgrade(this.layer, 35) || player["p"].unlocked
            },
            effect() {
                return new Decimal(player[this.layer].clickablesUnlock.length).add(1).pow(2)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
        42: {
            title: "Buyable Power 2",
            description: "Boost fourth buyable effect.",
            cost: new Decimal(1e25),
            unlocked() {
                return hasUpgrade(this.layer, 35) || player["p"].unlocked
            },
        },
        43: {
            title: "Need More Selection",
            description: "Unlock two new selection rows.",
            cost: new Decimal(1e33),
            unlocked() {
                return hasUpgrade(this.layer, 35) || player["p"].unlocked
            }
        },
        44: {
            title: "Boost Selection",
            description: "Boost fourth selection row effect.",
            cost: new Decimal(1e40),
            unlocked() {
                return hasUpgrade(this.layer, 35) || player["p"].unlocked
            }
        },
        45: {
            title: "Last type Upgrade!",
            description: "Unlock tree tab.",
            cost: new Decimal(1e45),
            unlocked() {
                return hasUpgrade(this.layer, 35) || player["p"].unlocked
            }
        },
        51: {
            title: "New Layer Upgrade",
            description: "Unlock 5 prestige upgrades.",
            cost: new Decimal(1e110),
            unlocked() {
                return player["p"].unlocked
            }
        },
        52: {
            title: "Extend Selection",
            description: "Unlock new 2 selection.",
            cost: new Decimal(1e160),
            unlocked() {
                return player["p"].unlocked
            }
        },
        53: {
            title: "Extend Tree",
            description: "Unlock tree tab.",
            cost: new Decimal(1e200),
            unlocked() {
                return player["p"].unlocked
            }
        },
        54: {
            title: "Extend buyable",
            description: "Unlock tree tab.",
            cost: new Decimal(1e200),
            unlocked() {
                return player["p"].unlocked
            }
        },
        55: {
            title: "Extend prestige upgrade",
            description: "Unlock tree tab.",
            cost: new Decimal(1e250),
            unlocked() {
                return player["p"].unlocked
            }
        },
        1011: {
            title: "Buyable Power 3",
            description: "Boost third buyable effect.",
            currencyDisplayName: "tree points",
            cost: new Decimal(3),
            req : [],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([45]),
            branches : [1021, 1022],
            style: TreeStyle
        },
        1021: {
            title: "Boost Self Synergy",
            description: "Boost \"Self Synergy\" upgrade. (upgrade 14)",
            cost: new Decimal(2),
            req : [1011],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1011]),
            effect() {
                return Decimal.log10(player.points.add(1)).add(1).pow(2)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            branches : [1031],
            style: TreeStyle
        },
        1022: {
            title: "More More Upgrades",
            description: "Boost \"More Upgrades\" upgrade. (upgrade 22)",
            cost: new Decimal(2),
            req : [1011],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1011]),
            effect() {
                return Decimal.log10(player.points.add(1)).add(1).pow(1.5)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            branches : [1032],
            style: TreeStyle
        },
        1031: {
            title: "Tree Power",
            description: "Total tree points boost point gain.",
            cost: new Decimal(2),
            req : [1021],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1021]),
            effect() {
                let total = player[this.layer].treePoint.add(player[this.layer].treePointSpent)
                return total.add(2).pow(4).div(16)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            branches : [1041, 1042],
            style: TreeStyle
        },
        1032: {
            title: "Tree Power 2",
            description: "Total tree points boost upgrade point gain.",
            cost: new Decimal(2),
            req : [1022],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1022]),
            effect() {
                let total = player[this.layer].treePoint.add(player[this.layer].treePointSpent)
                return total.add(2).pow(4).div(16)
            },
            effectDisplay() {  // Add formatting to the effect 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            branches : [1042, 1043],
            style: TreeStyle
        },
        1041: {
            title: "Cheap Tree",
            description: "Lower tree point cost ^0.95.",
            cost: new Decimal(2),
            req : [1031],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1031]),
            branches : [1051],
            style: TreeStyle
        },
        1042: {
            title: "Buyable Power 4",
            description: "Boost sixth buyable effect.",
            cost: new Decimal(5),
            req : [[1031], [1032]],
            canAfford : TreeMultiAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1031, 1032]),
            branches : [1052],
            style: TreeStyle
        },
        1043: {
            title: "Tree Products",
            description: "gain first five buyables based on tree point.",
            cost: new Decimal(2),
            req : [1032],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1032]),
            effect() {
                return player[this.layer].treePoint.pow(0.5)
            },
            effectDisplay() {  // Add formatting to the effect 
                return "+"+format(upgradeEffect(this.layer, this.id))
            },
            branches : [1053],
            style: TreeStyle
        },
        1051: {
            title: "Additional First Selection",
            description: "Additional selection in first row selection upgrades.",
            cost: new Decimal(1),
            req : [1041],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1041]),
            onPurchase() {
                player[this.layer].resetSelectionRows.push(1)
            },
            branches : [1061],
            style: TreeStyle
        },
        1052: {
            title: "Additional Second Selection",
            description: "Additional selection in second row selection upgrades.",
            cost: new Decimal(1),
            req : [1042],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1042]),
            onPurchase() {
                player[this.layer].resetSelectionRows.push(2)
            },
            branches : [1061],
            style: TreeStyle
        },
        1053: {
            title: "Additional Third Selection",
            description: "Additional selection in third row selection upgrades.",
            cost: new Decimal(1),
            req : [1043],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1043]),
            onPurchase() {
                player[this.layer].resetSelectionRows.push(3)
            },
            branches : [1061],
            style: TreeStyle
        },
        1061: {
            title: "Final Boost",
            description: "boost points and upgrade points by 10000.",
            cost: new Decimal(5),
            req : [[1051], [1052], [1053]],
            canAfford : TreeMultiAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1051, 1052, 1053]),
            effect() {
                return new Decimal(10000)
            },
            branches : [1071],
            style: TreeStyle
        },
        1071: {
            title: "Next Layer",
            description: "Unlock Next Layer.",
            cost: new Decimal(7),
            req : [1061],
            canAfford : TreeAffold,
            pay : TreePay,
            unlocked : TreeUnlock([1061]),
            style: TreeStyle
        },
    },
    buyables: {
        showRespec() {
            return true
        },
        respec() {
            player[this.layer].upgrades = player[this.layer].upgrades.filter(x => +x < 1000)
            player[this.layer].treePoint = player[this.layer].treePoint.add(player[this.layer].treePointSpent)
            player[this.layer].treePointSpent = new Decimal(0)

            let rows = player[this.layer].resetSelectionRows
            for(let row of rows) {
                for(let i = 1; i < 4; i++) {
                    let id = row * 10 + i
                    setClickableState(this.layer, id, false)
                }
            }

            player[this.layer].resetSelectionRows = []
            doReset(this.layer)
        },
        respecText() { return "Respec upgrade tree" },
        rows: 3,
        cols: 4,
        11: {
            title: "Add Point",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let cost = new Decimal(1000).mul(new Decimal(3).add(x).pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                if (getClickableState('u', 13)) value = value.times(clickableEffect('u', 13))
                if (hasUpgrade(this.layer, 1043)) value = value.add(upgradeEffect(this.layer, 1043))
                return value
            },
            display() { 
                return "+1 base point gain\n" +
                 "currently: +" + format(buyableEffect(this.layer, this.id)) + "\n\n" +
                 "cost: " + format(this.cost()) + " points"
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax : PointBuyMax,
            style: BuyableStyle
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
                if (hasUpgrade(this.layer, 1043)) value = value.add(upgradeEffect(this.layer, 1043))
                return new Decimal(base).pow(value)
            },
            display() { 
                let base = hasUpgrade(this.layer, 34) ? "x3" : "x2"
                return base + " point gain\n" +
                 "currently: " + format(buyableEffect(this.layer, this.id)) + "x" + "\n\n" +
                 "cost: " + format(this.cost()) + " points"
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax : PointBuyMax,
            style: BuyableStyle
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
                let base = hasUpgrade(this.layer, 1011) ? 3 : 2
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 33)) value = value.add(buyableEffect(this.layer, 21))
                if (getClickableState('u', 22)) value = value.add(clickableEffect('u', 22))
                if (hasUpgrade(this.layer, 1043)) value = value.add(upgradeEffect(this.layer, 1043))
                return new Decimal(base).pow(value)
            },
            display() { 
                let base = hasUpgrade(this.layer, 1011) ? "x3" : "x2"
                return base + " upgrade point gain\n" +
                 "currently: " + format(buyableEffect(this.layer, this.id)) + "x" + "\n\n" +
                 "cost: " + format(this.cost()) + " upgrade points"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax : UpgradePointBuyMax,
            style: BuyableStyle
        },
        14: {
            title: "Devide Upgrade Point Cost",
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
                if (hasUpgrade(this.layer, 1043)) value = value.add(upgradeEffect(this.layer, 1043))
                return new Decimal(base).pow(value.times(tmp.u.exponent))
            },
            display() {
                let base = hasUpgrade(this.layer, 42) ? "/3" : "/2"
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
            buyMax : UpgradePointBuyMax,
            style: BuyableStyle
        },
        21: {
            title: "Add First Row",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(5).pow(x.add(1).pow(0.8))
                let cost = new Decimal(1e7).mul(value.pow(x))
                if (hasUpgrade(this.layer, 33)) cost = cost.div(buyableEffect(this.layer, 22))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                if (hasUpgrade(this.layer, 1043)) value = value.add(upgradeEffect(this.layer, 1043))
                return value
            },
            display() { 
                return "+1 all buyables in the first row\n" +
                 "currently: +" + format(buyableEffect(this.layer, this.id)) + "\n\n" +
                 "cost: " + format(this.cost()) + " upgrade points"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax : UpgradePointBuyMax,
            unlocked() {
                return hasUpgrade(this.layer, 33)
            },
            style: BuyableStyle
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
                let base = hasUpgrade(this.layer, 1042) ? 3 : 2
                let value = getBuyableAmount(this.layer, this.id)
                return new Decimal(base).pow(value)
            },
            display() {
                let base = hasUpgrade(this.layer, 1042) ? "/3" : "/2"
                return base + " the buyable cost\n" +
                 "currently: /" + format(buyableEffect(this.layer, this.id)) + "\n\n" +
                 "cost: " + format(this.cost()) + " upgrade points"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax : UpgradePointBuyMax,
            unlocked() {
                return hasUpgrade(this.layer, 33)
            },
            style: BuyableStyle
        },
        111: {
            title: "Buy Tree Point",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let cost = new Decimal(1e40).mul(new Decimal(1e5).pow(x))
                if (hasUpgrade(this.layer, 1041)) cost = cost.pow(0.95)
                return cost
            },
            display() { 
                return "+1 tree point\n" +
                 "cost: " + format(this.cost()) + " points"
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                player[this.layer].treePoint = player[this.layer].treePoint.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 45)
            },
            style: BuyableStyle
        },
        112: {
            title: "Buy Tree Point",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let cost = new Decimal(1e40).mul(new Decimal(1e5).pow(x))
                if (hasUpgrade(this.layer, 1041)) cost = cost.pow(0.95)
                return cost
            },
            display() { 
                return "+1 tree point\n" +
                 "cost: " + format(this.cost()) + " upgrade points"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].treePoint = player[this.layer].treePoint.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 45)
            },
            style: BuyableStyle
        }
    },
    unlockCost() {
        return {
            0 : 1e21,
            1 : 1e29,
            2 : 1e33,
            3 : 1e36,
            4 : 1e163
        }
    },
    clickables : {
        rows: 10,
        cols: 3,
        11: {
            title: "Select Point",
            effect() {
                let value = Decimal.log10(player.points.add(1)).add(1)
                if (getClickableState('u', 41)) value = value.pow(clickableEffect('u', 41))
                return value
            },
            display() { 
                return "Point gain is boosted by itself\n" + 
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                let count = 1
                if (getClickableState('u', 51)) count += 1
                if (hasUpgrade("u", 1051)) count += 1

                if (count == 1) {
                    if(getClickableState(this.layer, 12) ||
                       getClickableState(this.layer, 13)) return false
                } else if (count == 2) {
                    if(getClickableState(this.layer, 12) &&
                       getClickableState(this.layer, 13)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (hasUpgrade(this.layer, 35)) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        12: {
            title: "Select Upgrade Point",
            effect() {
                let value = Decimal.log10(player[this.layer].points.add(1)).add(1).pow(0.6)
                if (getClickableState('u', 41)) value = value.pow(clickableEffect('u', 41))
                return value
            },
            display() { 
                return "Upgrade point gain is boosted by itself\n" + 
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                let count = 1
                if (getClickableState('u', 51)) count += 1
                if (hasUpgrade("u", 1051)) count += 1

                if (count == 1) {
                    if(getClickableState(this.layer, 11) ||
                       getClickableState(this.layer, 13)) return false
                } else if (count == 2) {
                    if(getClickableState(this.layer, 11) &&
                       getClickableState(this.layer, 13)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (hasUpgrade(this.layer, 35)) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        13: {
            title: "Select Buyable",
            effect() {
                let value = new Decimal(3)
                if (getClickableState('u', 41)) value = value.pow(clickableEffect('u', 41))
                return value
            },
            display() { 
                return "Multiply the number of first buyable you have\n" +
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                let count = 1
                if (getClickableState('u', 51)) count += 1
                if (hasUpgrade("u", 1051)) count += 1

                if (count == 1) {
                    if(getClickableState(this.layer, 11) ||
                       getClickableState(this.layer, 12)) return false
                } else if (count == 2) {
                    if(getClickableState(this.layer, 11) &&
                       getClickableState(this.layer, 12)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (hasUpgrade(this.layer, 35)) {
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
                if (getClickableState('u', 42)) value = value.times(clickableEffect('u', 42))
                return value
            },
            display() { 
                return "Gain free second buyables based on points\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id))
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                let count = 1
                if (getClickableState('u', 52)) count += 1
                if (hasUpgrade("u", 1052)) count += 1

                if (count == 1) {
                    if(getClickableState(this.layer, 22) ||
                       getClickableState(this.layer, 23)) return false
                } else if (count == 2) {
                    if(getClickableState(this.layer, 22) &&
                       getClickableState(this.layer, 23)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[0])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        22: {
            title: "Free Third Buyable",
            effect() {
                let value = getBuyableAmount(this.layer, 13)
                value = Decimal.log10(value.add(1)).times(2)
                if (getClickableState('u', 42)) value = value.times(clickableEffect('u', 42))
                return value
            },
            display() { 
                return "Gain free third buyables based on itself\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id))
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                let count = 1
                if (getClickableState('u', 52)) count += 1
                if (hasUpgrade("u", 1052)) count += 1

                if (count == 1) {
                    if(getClickableState(this.layer, 21) ||
                       getClickableState(this.layer, 23)) return false
                } else if (count == 2) {
                    if(getClickableState(this.layer, 21) &&
                       getClickableState(this.layer, 23)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[0])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        23: {
            title: "Free Fourth Buyable",
            effect() {
                let value = Decimal.log10(player[this.layer].points.add(1)).pow(0.4)
                if (getClickableState('u', 42)) value = value.times(clickableEffect('u', 42))
                return value
            },
            display() { 
                return "Gain free fourth buyables based on upgrade points\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id))
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                let count = 1
                if (getClickableState('u', 52)) count += 1
                if (hasUpgrade("u", 1052)) count += 1

                if (count == 1) {
                    if(getClickableState(this.layer, 21) ||
                       getClickableState(this.layer, 22)) return false
                } else if (count == 2) {
                    if(getClickableState(this.layer, 21) &&
                       getClickableState(this.layer, 22)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[0])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        31: {
            title: "Static Boost",
            effect() {
                let value = new Decimal(40)
                if (getClickableState('u', 43)) value = value.pow(clickableEffect('u', 43))
                return value
            },
            display() { 
                return "Static boost for points\n" + 
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                let count = 1
                if (getClickableState('u', 53)) count += 1
                if (hasUpgrade("u", 1053)) count += 1

                if (count == 1) {
                    if(getClickableState(this.layer, 32) ||
                       getClickableState(this.layer, 33)) return false
                } else if (count == 2) {
                    if(getClickableState(this.layer, 32) &&
                       getClickableState(this.layer, 33)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[1])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        32: {
            title: "Time Boost",
            effect() {
                let value = new Decimal(player[this.layer].resetTime + 3).log10().mul(25).add(1)
                if (getClickableState('u', 43)) value = value.pow(clickableEffect('u', 43))
                return value
            },
            display() { 
                return "Boost points based on time spent after upgrade layer reset\n" + 
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                let count = 1
                if (getClickableState('u', 53)) count += 1
                if (hasUpgrade("u", 1053)) count += 1

                if (count == 1) {
                    if(getClickableState(this.layer, 31) ||
                       getClickableState(this.layer, 33)) return false
                } else if (count == 2) {
                    if(getClickableState(this.layer, 31) &&
                       getClickableState(this.layer, 33)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[1])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        33: {
            title: "Reverse Time Boost",
            effect() {
                let value = new Decimal(player[this.layer].resetTime + 3).log10().mul(25).add(1)
                value = new Decimal(1000).div(value)
                if (getClickableState('u', 43)) value = value.pow(clickableEffect('u', 43))
                return value
            },
            display() { 
                return "Boost point, decreasing based on time spent after upgrade layer reset\n" + 
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                let count = 1
                if (getClickableState('u', 53)) count += 1
                if (hasUpgrade("u", 1053)) count += 1

                if (count == 1) {
                    if(getClickableState(this.layer, 31) ||
                       getClickableState(this.layer, 32)) return false
                } else if (count == 2) {
                    if(getClickableState(this.layer, 31) &&
                       getClickableState(this.layer, 32)) return false
                }
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[1])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        41: {
            title: "Enhance first row",
            effect() {
                let value = new Decimal(2)
                if (hasUpgrade(this.layer, 44)) value = value.add(1)
                return value
            },
            display() { 
                return "The selection upgrades in first row are stronger\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id).sub(1).times(100)) + "%"
            },
            canClick() {
                if (hasUpgrade("p", 12)) {
                    setClickableState(this.layer, this.id, true)
                    return false
                }
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
            style : SelectionStyle,
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[2])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        42: {
            title: "Enhance second row",
            effect() {
                let value = new Decimal(2)
                if (hasUpgrade(this.layer, 44)) value = value.add(1)
                return value
            },
            display() { 
                return "The selection upgrades in second row are stronger\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id).sub(1).times(100)) + "%"
            },
            canClick() {
                if (hasUpgrade("p", 12)) {
                    setClickableState(this.layer, this.id, true)
                    return false
                }
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
            style : SelectionStyle,
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[2])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        43: {
            title: "Enhance third row",
            effect() {
                let value = new Decimal(2)
                if (hasUpgrade(this.layer, 44)) value = value.add(1)
                return value
            },
            display() { 
                return "The selection upgrades in third row are stronger\n" + 
                "currently : +" + format(clickableEffect(this.layer, this.id).sub(1).times(100)) + "%"
            },
            canClick() {
                if (hasUpgrade("p", 12)) {
                    setClickableState(this.layer, this.id, true)
                    return false
                }
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
            style : SelectionStyle,
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[2])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        51: {
            title: "More first selection",
            display() { 
                return "One more selection in first row" 
            },
            canClick() {
                if (hasUpgrade("p", 13)) {
                    setClickableState(this.layer, this.id, true)
                    return false
                }
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
            style : SelectionStyle,
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[3])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        52: {
            title: "More second selection",
            display() { 
                return "One more selection in second row" 
            },
            canClick() {
                if (hasUpgrade("p", 13)) {
                    setClickableState(this.layer, this.id, true)
                    return false
                }
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
            style : SelectionStyle,
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[3])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        53: {
            title: "More third selection",
            display() { 
                return "One more selection in third row"
            },
            canClick() {
                if (hasUpgrade("p", 13)) {
                    setClickableState(this.layer, this.id, true)
                    return false
                }
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
            style : SelectionStyle,
            unlocked() {
                if (!hasUpgrade(this.layer, 43)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[3])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        61: {
            title: "Boost Prestige",
            effect() {
                let value = new Decimal(1.5)
                return value
            },
            display() { 
                return "The effect of prestige points are stronger\n" +
                "currently : +" + format(clickableEffect(this.layer, this.id).sub(1).times(100)) + "%"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 61) ||
                   getClickableState(this.layer, 62) ||
                   getClickableState(this.layer, 63)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (!hasUpgrade(this.layer, 52)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[4])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        62: {
            title: "Prestige Boost",
            effect() {
                let value = Decimal.log10(player["p"].points.add(1)).pow(5)
                return value
            },
            display() { 
                return "Upgrade point gain is boosted by prestige points\n" +
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 61) ||
                   getClickableState(this.layer, 62) ||
                   getClickableState(this.layer, 63)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (!hasUpgrade(this.layer, 52)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[4])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
        63: {
            title: "Reverse Prestige Boost",
            effect() {
                let value = Decimal.log10(player["u"].points.add(1)).pow(0.3)
                return value
            },
            display() { 
                return "Prestige point gain is boosted by upgrade points\n" +
                "currently : " + format(clickableEffect(this.layer, this.id)) + "x"
            },
            canClick() {
                if(getClickableState(this.layer, this.id)) return true
                if(getClickableState(this.layer, 61) ||
                   getClickableState(this.layer, 62) ||
                   getClickableState(this.layer, 63)) return false
                return true
            },
            onClick() {
                setClickableState(this.layer, this.id, !getClickableState(this.layer, this.id))
                if (!getClickableState(this.layer, this.id)) doReset(this.layer)
            },
            style : SelectionStyle,
            unlocked() {
                if (!hasUpgrade(this.layer, 52)) return false
                if (player[this.layer].clickablesUnlock.includes(this.id)) return true
                if (player[this.layer].points.gte(tmp.u.unlockCost[4])) {
                    player[this.layer].clickablesUnlock.push(this.id)
                    return true
                }
                return false
            }
        },
    }
})
