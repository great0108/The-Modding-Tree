// const ColorBuyableStyle = {'height':'150px', 'width':'150px'}
const SpellStyle = { margin: "7px", 'height':'150px', 'width':'150px' }

function ColorBuyableStyle() {
    let css = {}
    if(this.canAfford(this.layer, this.id)) css["background"] = "white"
    return css
}

function ColorClickableStyle() {
    let css = {'height':'50px', 'width':'50px', 'min-height':'50px'}
    let color = ""
    if(this.id == 111 || this.id == 112 || this.id == 113) color = "red"
    else if(this.id == 121 || this.id == 122 || this.id == 123) color = "green"
    else if(this.id == 131 || this.id == 132 || this.id == 133) color = "blue"

    if(this.canClick(this.layer, this.id)) css["background"] = color
    return css
}


addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        milestoneCond : [],
        magic : new Decimal(0),
        spellTime : {
            11: new Decimal(0),
            12: new Decimal(0),
            13: new Decimal(0)
        },
        spellInput : {
            11: new Decimal(0),
            12: new Decimal(0),
            13: new Decimal(0)
        },
        energy : new Decimal(0),
        colors : [new Decimal(0), new Decimal(0), new Decimal(0)],
        maxColors : [new Decimal(10), new Decimal(10), new Decimal(10)],
        colorPoint : new Decimal(0),
        timeAfterChange : new Decimal(0.1)
    }},
    color: "#415a9e",
    requires() {return new Decimal(1e100)}, // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "upgrade points", // Name of resource prestige is based on
    baseAmount() {return player["u"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("p", 11)) mult = mult.mul(upgradeEffect("p", 11))
        if (hasUpgrade("p", 14)) mult = mult.mul(upgradeEffect("p", 14))
        if (getClickableState("u", 63)) mult = mult.mul(clickableEffect("u", 63))
        if (hasUpgrade("p", 15)) mult = mult.mul(clickableEffect("p", 13))
        if (hasUpgrade("u", 1101)) mult = mult.mul(upgradeEffect("u", 1101)[0])
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    effect() {
        let mult = player["p"].points.add(1).log10().mul(2).add(1).pow(5)
        if(hasUpgrade("p", 21)) mult = mult.pow(1.2)
        if(getClickableState("u", 61)) mult = mult.pow(clickableEffect("u", 61))
        if(hasUpgrade("u", 1081)) mult = mult.pow(upgradeEffect("u", 1081))
        return mult
    },
    effectDescription() { // Optional text to describe the effects
        return "which are boosting points and upgrade points by "+format(this.effect())
    },
    magicEffect() {
        let value = player[this.layer].magic
        value = value.add(1).log10().div(2).add(1).pow(2)
        return value
    },
    spellPower() {
        let mult = new Decimal(1)
        mult = mult.add(this.magicEffect().div(100))
        if(hasUpgrade("p", 22)) mult = mult.add(upgradeEffect("p", 22))
        if(hasUpgrade("u", 1091)) mult = mult.add(upgradeEffect("u", 1091))
        return mult
    },
    energyGain() {
        let value = new Decimal(0.1)
        value = value.mul(this.redEffect())
        value = value.mul(this.greenEffect())
        value = value.mul(this.blueEffect())
        if(hasUpgrade("p", 112) && Array.isArray(upgradeEffect("p", 112))) {
            value = value.mul(upgradeEffect("p", 112)[1])
            value = value.pow(upgradeEffect("p", 112)[0])
        }
        return value
    },
    redEffect() {
        let value = new Decimal(3.5)
        if(hasUpgrade("p", 111)) value = value.mul(upgradeEffect("p", 111))
        return value.pow(player[this.layer].colors[0])
    },
    greenEffect() {
        let value = player[this.layer].energy.log10().add(1).div(Decimal.log10(15)).max(1)
        return value.pow(player[this.layer].colors[1])
    },
    blueEffect() {
        let value = player[this.layer].timeAfterChange.log10().div(Decimal.log10(4)).add(2)
        return value.pow(player[this.layer].colors[2])
    },
    yellowEffect() {
        let value = Decimal.min(player[this.layer].colors[0], player[this.layer].colors[1])
        value = new Decimal(10).pow(value)
        if(hasUpgrade("p", 113)) value = value.pow(upgradeEffect("p", 113))
        return value
    },
    nextPurpleUnlock() {
        let value = Decimal.min(player[this.layer].colors[0], player[this.layer].colors[2])
        return value.div(3).floor().mul(3).add(3)
    },
    cyanEffect() {
        let value = Decimal.min(player[this.layer].colors[1], player[this.layer].colors[2])
        value = new Decimal(2).pow(value)
        if(hasUpgrade("p", 113)) value = value.pow(upgradeEffect("p", 113))
        return value
    },
    branches: ["u"],
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    onPrestige(gain) {
        let count = 0
        for(let i = 1; i <= 5; i++) {
            for(let j = 1; j <= 5; j++) {
                let id = i * 10 + j
                if (hasUpgrade("u", id)) {
                    count += 1
                }
            }
        }
        if(count <= 15 && !player[this.layer].milestoneCond.includes(1)) {
            player[this.layer].milestoneCond.push(1)
        }

        if(getBuyableAmount("u", 22).eq(0) && !player[this.layer].milestoneCond.includes(2)) {
            player[this.layer].milestoneCond.push(2)
        }

        let check = true
        for(let i = 1; i <= 5; i++) {
            for(let j = 1; j <= 3; j++) {
                let id = i * 10 + j
                if(!getClickableState('u', id)) check = false
            }
        }
        if(check && !player[this.layer].milestoneCond.includes(3)) {
            player[this.layer].milestoneCond.push(3)
        }

        if(player["u"].treePoint.eq(0) && player["u"].treePointSpent.eq(0) && !hasUpgrade("u", 1011)) {
            if(!player[this.layer].milestoneCond.includes(4)) {
                player[this.layer].milestoneCond.push(4)
            }
        }

        if(player["u"].treePoint.gte(50) && !player[this.layer].milestoneCond.includes(5)) {
            player[this.layer].milestoneCond.push(5)
        }
    },
    update(diff) {
        let spellTime = player[this.layer].spellTime
        for(let id in spellTime) {
            if(spellTime[id].gt(diff)) {
                spellTime[id] = spellTime[id].sub(diff)
            } else {
                spellTime[id] = new Decimal(0)
            }
        }
        if(hasUpgrade("p", 23)) {
            player[this.layer].energy = player[this.layer].energy.add(tmp.p.energyGain.mul(diff))
            player[this.layer].timeAfterChange = player[this.layer].timeAfterChange.add(diff)
        }
    },
    unlocked() {
        return hasUpgrade("u", 1071)
    },
    layerShown() {
        return hasUpgrade("u", 1071) || player["p"].unlocked
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                "milestones",
                "blank",
                ["row", [["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14], ["upgrade", 15]]],
                ["row", [["upgrade", 21], ["upgrade", 22], ["upgrade", 23], ["upgrade", 24], ["upgrade", 25]]],
            ],
        },
        "Spell": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                ["display-text", function() {
                    return "When activate any spell, insert 10% of your prestige points into the spell"
                }],
                "blank",
                ["display-text", function() {
                    return "Spell Power : " + format(tmp.p.spellPower.mul(100)) + "%"
                }],
                "blank",
                ["row", [["clickable", 11], ["clickable", 12], ["clickable", 13]]],
                "blank",
                ["display-text", function() {
                    return "You have " + format(player[this.layer].magic) +
                    " magic, which are boosting spells +" + format(tmp.p.magicEffect) + "%"
                }]
            ],
            unlocked() {
                return hasUpgrade("p", 15)
            }
        },
        "Color": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                ["display-text", function() {
                    return "You have unspent " + player[this.layer].colorPoint + " color points"
                }],
                "blank",
                ["display-text", function() {
                    return "You have " + format(player[this.layer].energy) + " energy (" + format(tmp.p.energyGain) + "/s)"
                }],
                "blank",
                "blank",
                "buyables",
                "blank",
                "blank",
                ["row", [
                 ["bar", "redBar"], ["column", [["blank", "50px"], ["clickable", 111], ["clickable", 112], ["clickable", 113]]],
                 ["blank", ["50px", "50px"]], ["bar", "greenBar"], ["column", [["blank", "50px"], ["clickable", 121], ["clickable", 122], ["clickable", 123]]],
                 ["blank", ["50px", "50px"]], ["bar", "blueBar"], ["column", [["blank", "50px"], ["clickable", 131], ["clickable", 132], ["clickable", 133]]]
                ]],
                "blank",
                ["row", [
                 ["column", [
                    ["display-text", function() {return "Red"}],
                    ["display-text", function() {return "static x" + format(tmp.p.redEffect)}]
                 ]],
                 ["blank", ["50px", "50px"]],
                 ["column", [
                    ["display-text", function() {return "Green"}],
                    ["display-text", function() {return "x" + format(tmp.p.greenEffect) + " based energy"}]
                 ]],
                 ["blank", ["50px", "50px"]],
                 ["column", [
                    ["display-text", function() {return "Blue"}],
                    ["display-text", function() {return "x" + format(tmp.p.blueEffect) + " based time"}]
                 ]],
                ]],
                "blank",
                ["row", [
                 ["column", [
                    ["display-text", function() {return "Yellow"}],
                    ["display-text", function() {return "boost points"}],
                    ["display-text", function() {return "x" + format(tmp.p.yellowEffect)}]
                 ]],
                 ["blank", ["50px", "50px"]],
                 ["column", [
                    ["display-text", function() {return "Purple"}],
                    ["display-text", function() {return "unlock upgrades"}],
                    ["display-text", function() {
                        if(tmp.p.nextPurpleUnlock.gt(10)) return "all unlocked"
                        return "next : " + format(tmp.p.nextPurpleUnlock, 0)
                    }]
                 ]],
                 ["blank", ["50px", "50px"]],
                 ["column", [
                    ["display-text", function() {return "Cyan"}],
                    ["display-text", function() {return "divide cost"}],
                    ["display-text", function() {return "/" + format(tmp.p.cyanEffect)}]
                 ]],
                ]],
                "blank",
                "blank",
                ["row", [["upgrade", 111], ["upgrade", 112], ["upgrade", 113]]]
            ],
            unlocked() {
                return hasUpgrade("p", 23)
            }
        },
    },
    // keep upgrade, auto buyable, keep selection, keep tree, auto tree point
    milestones: {
        1: {
            requirementDescription: "prestige with 15 or fewer upgrades in upgrades tab",
            effectDescription: "Keep upgrades in upgrades tab on reset.",
            done() { 
                return player[this.layer].milestoneCond.includes(1)
            }
        },
        2: {
            requirementDescription: "prestige without sixth buyable",
            effectDescription: "Unlock auto buyables.",
            done() { 
                return player[this.layer].milestoneCond.includes(2)
            },
            unlocked() {
                return hasMilestone("p", 1)
            },
            toggles : [["u", "autoBuyable"]]
        },
        3: {
            requirementDescription: "prestige with all selections are selected",
            effectDescription: "Keep selection on reset.",
            done() { 
                return player[this.layer].milestoneCond.includes(3)

            },
            unlocked() {
                return hasMilestone("p", 2)
            },
        },
        4: {
            requirementDescription: "prestige without tree upgrades and tree points",
            effectDescription: "Keep tree upgrades and tree points on reset.",
            done() { 
                return player[this.layer].milestoneCond.includes(4)
            },
            unlocked() {
                return hasMilestone("p", 3)
            },
        },
        5: {
            requirementDescription: "prestige with more than 50 tree points",
            effectDescription: "Unlock auto tree points.",
            done() { 
                return player[this.layer].milestoneCond.includes(5)
            },
            unlocked() {
                return hasMilestone("p", 4)
            },
            toggles : [["u", "autoTreePoint"]]
        }
    },
    upgrades: {
        11: {
            title: "Boost prestige",
            description: "Boost prestige point gain based on points.",
            cost: new Decimal(10),
            effect() {
                let value = Decimal.log10(player.points.add(1)).div(20).add(1)
                return value
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            unlocked() {
                return hasUpgrade("u", 51)
            }
        },
        12: {
            title: "Row 4 Selection",
            description: "You can activate all row 4 selection.",
            cost: new Decimal(100),
            unlocked() {
                return hasUpgrade("u", 51)
            }
        },
        13: {
            title: "Row 5 Selection",
            description: "You can activate all row 5 selection.",
            cost: new Decimal(1e6),
            unlocked() {
                return hasUpgrade("u", 51)
            }
        },
        14: {
            title: "More Prestige",
            description: "Boost Prestige point gain based on itself.",
            cost: new Decimal(1e9),
            effect() {
                let value = Decimal.log10(player[this.layer].points.add(1)).add(1)
                if(hasUpgrade("u", 1092)) mult = mult.pow(2)
                return value
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            unlocked() {
                return hasUpgrade("u", 51)
            }
        },
        15: {
            title: "New Type Boost",
            description: "Unlock spell tab.",
            cost: new Decimal(1e10),
            unlocked() {
                return hasUpgrade("u", 51)
            }
        },
        21: {
            title: "Prestige Power",
            description: "Raise the effect of prestige points and sixth selection row ^1.2.",
            cost: new Decimal(5e14),
            unlocked() {
                return hasUpgrade("u", 54)
            }
        },
        22: {
            title: "Spell Power",
            description: "Spells are more effective.",
            cost: new Decimal(1e16),
            effect() {
                let value = new Decimal(0.6)
                return value
            },
            effectDisplay() {
                return "+" + format(upgradeEffect(this.layer, this.id).mul(100))+"%" 
            },
            unlocked() {
                return hasUpgrade("u", 54)
            }
        },
        23: {
            title: "New Type Boost Again",
            description: "Unlock color tab.",
            cost: new Decimal(1e17),
            unlocked() {
                return hasUpgrade("u", 54)
            }
        },
        24: {
            title: "Longer Spell",
            description: "Increase duration of the spells",
            cost: new Decimal(1e20),
            effect() {
                let value = new Decimal(3)
                return value
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            unlocked() {
                return hasUpgrade("u", 54)
            }
        },
        25: {
            title: "Row 6 Selection",
            description: "You can activate all row 6 selection.",
            cost: new Decimal(1e21),
            unlocked() {
                return hasUpgrade("u", 54)
            }
        },
        111: {
            title: "Boost Red",
            description: "Red effect is tripled",
            cost: new Decimal(1e3),
            effect() {
                if(!this.unlocked()) return new Decimal(1)
                return new Decimal(3)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            currencyDisplayName: "energy",
            currencyInternalName: "energy",
            currencyLayer: "p",
            unlocked() {
                let value = Decimal.min(player[this.layer].colors[0], player[this.layer].colors[2])
                return value.gte(3)
            },
            canAfford() { 
                return player[this.layer].energy.gte(this.cost) 
            },
            buy() {
                player[this.layer].energy = player[this.layer].energy.sub(this.cost())
            },
        },
        112: {
            title: "White",
            description: "Energy gain is stronger",
            cost: new Decimal(1e12),
            effect() {
                if(!this.unlocked()) return new Decimal(1)
                let value = player[this.layer].colors[0].min(player[this.layer].colors[1]).min(player[this.layer].colors[2])
                return [new Decimal(1).add(value.add(1).log10().div(10)), new Decimal(100).mul(value).max(1)]
            },
            effectDisplay() {
                return "^" + format(upgradeEffect(this.layer, this.id)[0]) + ", " + format(upgradeEffect(this.layer, this.id)[1]) + "x"
            },
            currencyDisplayName: "energy",
            currencyInternalName: "energy",
            currencyLayer: "p",
            unlocked() {
                let value = Decimal.min(player[this.layer].colors[0], player[this.layer].colors[2])
                return value.gte(6)
            },
            canAfford() { 
                return player[this.layer].energy.gte(this.cost) 
            },
            buy() {
                player[this.layer].energy = player[this.layer].energy.sub(this.cost())
            },
        },
        113: {
            title: "Color Mixer",
            description: "Yellow & Cyan effect is squared",
            cost: new Decimal(1e33),
            effect() {
                if(!this.unlocked()) return new Decimal(1)
                return new Decimal(2)
            },
            effectDisplay() {
                return "^" + format(upgradeEffect(this.layer, this.id))
            },
            currencyDisplayName: "energy",
            currencyInternalName: "energy",
            currencyLayer: "p",
            unlocked() {
                let value = Decimal.min(player[this.layer].colors[0], player[this.layer].colors[2])
                return value.gte(9)
            },
            canAfford() { 
                return player[this.layer].energy.gte(this.cost) 
            },
            buy() {
                player[this.layer].energy = player[this.layer].energy.sub(this.cost())
            },
        },
    },
    buyables : {
        11: {
            title: "Buy Color Point",
            cost(x=getBuyableAmount(this.layer, this.id)) {
                let value = new Decimal(2).add(x)
                let cost = new Decimal(1).mul(value.pow(x))
                cost = cost.div(tmp.p.cyanEffect)
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
                return "cost: " + format(this.cost()) + " energy"
            },
            canAfford() { return player[this.layer].energy.gte(this.cost()) },
            buy() {
                player[this.layer].energy = player[this.layer].energy.sub(this.cost())
                player[this.layer].colorPoint = player[this.layer].colorPoint.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style : ColorBuyableStyle
        },
    },
    clickables : {
        rows: 1,
		cols: 6,
        11: {
            title: "Replicate Point",
            effect() {
                if (player[this.layer].spellTime[11].eq(0)) {
                    player[this.layer].spellInput[11] = new Decimal(0)
                }
                let value = player[this.layer].spellInput[11]
                value = value.add(1).log10().div(2).add(1).pow(5)
                value = value.pow(tmp.p.spellPower)
                return value
            },
            display() { 
                return "Effect : point x" + format(clickableEffect(this.layer, this.id)) + "\n" +
                "Time : " + format(player[this.layer].spellTime[11]) + "s"
            },
            canClick() {
                return player[this.layer].points.gt(0)
            },
            onClick() {
                let input = player[this.layer].points.div(10).ceil()
                let time = input.log10()
                if(hasUpgrade("p", 24)) time = time.mul(3)

                player[this.layer].spellInput[11] = input
                player[this.layer].spellTime[11] = time
                player[this.layer].magic = player[this.layer].magic.add(input.pow(0.5))
                player[this.layer].points = player[this.layer].points.sub(input)
            },
            style : SpellStyle,
            unlocked() {
                return hasUpgrade("p", 15)
            }
        },
        12: {
            title: "Replicate Upgrade Point",
            effect() {
                if (player[this.layer].spellTime[12].eq(0)) {
                    player[this.layer].spellInput[12] = new Decimal(0)
                }
                let value = player[this.layer].spellInput[12]
                value = value.add(1).log10().div(2.5).add(1).pow(5)
                value = value.pow(tmp.p.spellPower)
                return value
            },
            display() { 
                return "Effect : upgrade point x" + format(clickableEffect(this.layer, this.id)) + "\n" +
                "Time : " + format(player[this.layer].spellTime[12]) + "s"
            },
            canClick() {
                return player[this.layer].points.gt(0)
            },
            onClick() {
                let input = player[this.layer].points.div(10).ceil()
                let time = input.log10()
                if(hasUpgrade("p", 24)) time = time.mul(3)

                player[this.layer].spellInput[12] = input
                player[this.layer].spellTime[12] = time
                player[this.layer].magic = player[this.layer].magic.add(input.pow(0.5))
                player[this.layer].points = player[this.layer].points.sub(input)
            },
            style : SpellStyle,
            unlocked() {
                return hasUpgrade("p", 15)
            }
        },
        13: {
            title: "Replicate Prestige Point",
            effect() {
                if (player[this.layer].spellTime[13].eq(0)) {
                    player[this.layer].spellInput[13] = new Decimal(0)
                }
                let value = player[this.layer].spellInput[13]
                value = value.add(1).log10().div(2.5).add(1).pow(0.5)
                value = value.pow(tmp.p.spellPower)
                return value
            },
            display() { 
                return "Effect : prestige point x" + format(clickableEffect(this.layer, this.id)) + "\n" +
                "Time : " + format(player[this.layer].spellTime[13]) + "s"
            },
            canClick() {
                return player[this.layer].points.gt(0)
            },
            onClick() {
                let input = player[this.layer].points.div(10).ceil()
                let time = input.log10()
                if(hasUpgrade("p", 24)) time = time.mul(3)

                player[this.layer].spellInput[13] = input
                player[this.layer].spellTime[13] = time
                player[this.layer].magic = player[this.layer].magic.add(input.pow(0.5))
                player[this.layer].points = player[this.layer].points.sub(input)
            },
            style : SpellStyle,
            unlocked() {
                return hasUpgrade("p", 15)
            }
        },
        111: {
            title: "+",
            canClick() {
                return player[this.layer].colorPoint.gt(0) && player[this.layer].colors[0].lt(player[this.layer].maxColors[0])
            },
            onClick() {
                player[this.layer].colorPoint = player[this.layer].colorPoint.sub(1)
                player[this.layer].colors[0] = player[this.layer].colors[0].add(1)
                player[this.layer].timeAfterChange = new Decimal(0.1)
            },
            style : ColorClickableStyle
        },
        112: {
            title: "-",
            canClick() {
                return player[this.layer].colors[0].gt(0)
            },
            onClick() {
                player[this.layer].colorPoint = player[this.layer].colorPoint.add(1)
                player[this.layer].colors[0] = player[this.layer].colors[0].sub(1)
                player[this.layer].timeAfterChange = new Decimal(0.1)
            },
            style : ColorClickableStyle
        },
        113: {
            title: "0",
            canClick() {
                return player[this.layer].colors[0].gt(0)
            },
            onClick() {
                let value = player[this.layer].colors[0]
                player[this.layer].colorPoint = player[this.layer].colorPoint.add(value)
                player[this.layer].colors[0] = player[this.layer].colors[0].sub(value)
                player[this.layer].timeAfterChange = new Decimal(0.1)
            },
            style : ColorClickableStyle
        },
        121: {
            title: "+",
            canClick() {
                return player[this.layer].colorPoint.gt(0) && player[this.layer].colors[1].lt(player[this.layer].maxColors[1])
            },
            onClick() {
                player[this.layer].colorPoint = player[this.layer].colorPoint.sub(1)
                player[this.layer].colors[1] = player[this.layer].colors[1].add(1)
                player[this.layer].timeAfterChange = new Decimal(0.1)
            },
            style : ColorClickableStyle
        },
        122: {
            title: "-",
            canClick() {
                return player[this.layer].colors[1].gt(0)
            },
            onClick() {
                player[this.layer].colorPoint = player[this.layer].colorPoint.add(1)
                player[this.layer].colors[1] = player[this.layer].colors[1].sub(1)
                player[this.layer].timeAfterChange = new Decimal(0.1)
            },
            style : ColorClickableStyle
        },
        123: {
            title: "0",
            canClick() {
                return player[this.layer].colors[1].gt(0)
            },
            onClick() {
                let value = player[this.layer].colors[1]
                player[this.layer].colorPoint = player[this.layer].colorPoint.add(value)
                player[this.layer].colors[1] = player[this.layer].colors[1].sub(value)
                player[this.layer].timeAfterChange = new Decimal(0.1)
            },
            style : ColorClickableStyle
        },
        131: {
            title: "+",
            canClick() {
                return player[this.layer].colorPoint.gt(0) && player[this.layer].colors[2].lt(player[this.layer].maxColors[2])
            },
            onClick() {
                player[this.layer].colorPoint = player[this.layer].colorPoint.sub(1)
                player[this.layer].colors[2] = player[this.layer].colors[2].add(1)
                player[this.layer].timeAfterChange = new Decimal(0.1)
            },
            style : ColorClickableStyle
        },
        132: {
            title: "-",
            canClick() {
                return player[this.layer].colors[2].gt(0)
            },
            onClick() {
                player[this.layer].colorPoint = player[this.layer].colorPoint.add(1)
                player[this.layer].colors[2] = player[this.layer].colors[2].sub(1)
                player[this.layer].timeAfterChange = new Decimal(0.1)
            },
            style : ColorClickableStyle
        },
        133: {
            title: "0",
            canClick() {
                return player[this.layer].colors[2].gt(0)
            },
            onClick() {
                let value = player[this.layer].colors[2]
                player[this.layer].colorPoint = player[this.layer].colorPoint.add(value)
                player[this.layer].colors[2] = player[this.layer].colors[2].sub(value)
                player[this.layer].timeAfterChange = new Decimal(0.1)
            },
            style : ColorClickableStyle
        }
    },
    bars: {
        redBar: {
            direction: UP,
            width: 50,
            height: 200,
            progress() { 
                return player[this.layer].colors[0] / player[this.layer].maxColors[0]
            },
            fillStyle : {
                "background-color" : "#ff0000"
            }
        },
        greenBar: {
            direction: UP,
            width: 50,
            height: 200,
            progress() { 
                return player[this.layer].colors[1] / player[this.layer].maxColors[1]
            },
            fillStyle : {
                "background-color" : "#00ff00"
            }
        },
        blueBar: {
            direction: UP,
            width: 50,
            height: 200,
            progress() { 
                return player[this.layer].colors[2] / player[this.layer].maxColors[2]
            },
            fillStyle : {
                "background-color" : "#0000ff"
            }
        },
    }
})