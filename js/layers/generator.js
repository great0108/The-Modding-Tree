function GemBuyMax() {
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
    this.buyMulti(amount, cost)
}

addLayer("g", {
    name: "generator", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        power: new Decimal(0),
        flow: new Decimal(0),
        gem: {
            11: new Decimal(0),
            12: new Decimal(0),
            13: new Decimal(0),
            14: new Decimal(0)
        }
    }},
    color: "#31aeb0",
    requires() {return new Decimal(1e200)}, // Can be a function that takes requirement increases into account
    resource: "generator points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.1, // Prestige currency exponent
    base: new Decimal(1e10),
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    effect() {
        if (player["g"].points.eq(0)) return new Decimal(0)
        let base = new Decimal(5)
        if (hasUpgrade("g", 13)) base = base.add(upgradeEffect("g", 13))

        let mult = base.pow(player["g"].points.sub(1))
        if(getClickableState("u", 71)) mult = mult.mul(clickableEffect("u", 71))
        if(getClickableState("u", 73)) mult = mult.mul(clickableEffect("u", 73))
        if(hasUpgrade("u", 1093)) mult = mult.mul(upgradeEffect("u", 1093))
        if (hasUpgrade("u", 1101)) mult = mult.mul(upgradeEffect("u", 1101)[1])
        return mult
    },
    effectDescription() { // Optional text to describe the effects
        return "which are generating " + format(this.effect()) + " generator power/sec"
    },
    powerEffect() {
        let mult = player["g"].power.add(1).log10().add(1).pow(20)
        if(getClickableState("u", 72)) mult = mult.pow(clickableEffect("u", 72))
        if(hasUpgrade("u", 1082)) mult = mult.pow(upgradeEffect("u", 1082))
        return mult
    },
    flowGain() {
        let mult = player["g"].power.add(1).log10()
        return mult
    },
    flowEffect() {
        let mult = player["g"].flow.add(1).pow(3)
        return mult
    },
    T1GemGain() {
        return new Decimal(1)
    },
    branches: ["u"],
    hotkeys: [
        {key: "g", description: "G: Reset for generator points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        // player[this.layer].power = new Decimal(0)
        
        player[this.layer].power = player[this.layer].power.add(tmp.g.effect.mul(diff))
        if(hasUpgrade("g", 14)) player[this.layer].flow = player[this.layer].flow.add(tmp.g.flowGain.mul(diff))
        if(hasUpgrade("g", 15)) {
            player[this.layer].gem[11] = player[this.layer].gem[11].add(tmp.g.T1GemGain.mul(diff))
        }
    },
    unlocked() {
        return player.points.gte(1e200)
    },
    layerShown() {
        return hasUpgrade("u", 55) || player["g"].unlocked
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                ["display-text", function() {
                    return "You have " + format(player["g"].power) + " generator power, which boosts point gain by " + format(tmp.g.powerEffect)
                }],
                ["display-text", function() {
                    return hasUpgrade("g", 14) ? "Generator power also generates " +  format(tmp.g.flowGain) + " generator flow/sec" : ""
                }],
                "blank",
                ["display-text", function() {
                    return (hasUpgrade("g", 14) ? "\n\nYou have " + format(player["g"].flow) + " generator flow, which boosts upgrade point gain by " + format(tmp.g.flowEffect) : "")
                }],
                "blank",
                "upgrades"
            ],
        },
        "Gem": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                ["row", [
                    ["display-text", 
                        function () { return true ? "Tier 1 Gem : " + format(player[this.layer].gem[11]) + " (+" + format(tmp.g.T1GemGain) + "/s)" : ""},
                        {width: "400px", display: "inline-block"}
                    ], 
                    ["buyable", 11]
                ]],
            ],
            unlocked() {
                return hasUpgrade("u", 25)
            },
        },
    },
    upgrades: {
        11: {
            title: "Generator Boost",
            description: "Generators boost upgrade point gain",
            cost: new Decimal(2),
            effect() {
                let value = player["g"].points.add(1).pow(6)
                return value
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            unlocked() {
                return hasUpgrade("u", 61)
            }
        },
        12: {
            title: "Generator Boost 2",
            description: "Generators boost prestige point gain",
            cost: new Decimal(3),
            effect() {
                let value = player["g"].points.add(1).pow(2)
                return value
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            unlocked() {
                return hasUpgrade("u", 61)
            }
        },
        13: {
            title: "Base Generator",
            description: "Generators add to the Generator base.",
            cost: new Decimal(4),
            effect() {
                let value = player["g"].points.pow(0.5)
                return value
            },
            effectDisplay() {
                return "+" + format(upgradeEffect(this.layer, this.id))
            },
            unlocked() {
                return hasUpgrade("u", 61)
            }
        },
        14: {
            title: "Generator Flow",
            description: "Unlock generator flow generated by generator power.",
            cost: new Decimal(5),
            unlocked() {
                return hasUpgrade("u", 61)
            }
        },
        15: {
            title: "New Type Generator",
            description: "Unlock gem tab.",
            cost: new Decimal(6),
            unlocked() {
                return hasUpgrade("u", 61)
            }
        }
    },
    buyables: {
        11: {
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(3)
                let cost = new Decimal(10).mul(value.pow(x))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                return value.pow(0.5)
            },
            display() { 
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + "\nTier 1 Gem"
            },
            canAfford() { return player[this.layer].gem[this.id].gte(this.cost()) },
            buy() {
                this.buyMulti(1, this.cost())
            },
            buyMulti(amount, cost) {
                if(!amount) return
                player.points = player.points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
            },
            buyMax : GemBuyMax,
            style: { width: '175px', height: '50px', borderRadius: '10px', "font-size": "16px" }
        },
    }
})