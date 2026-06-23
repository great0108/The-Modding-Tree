function GemBuyMax(freeCost) {
    if (!this.canAfford()) return
    let x = getBuyableAmount(this.layer, this.id)
    let amount = new Decimal(1)
    while (true) {
        let cost = this.cost(x.add(amount.mul(10)).sub(1))
        if (player[this.layer].gem[this.id].lte(cost)) break
        amount = amount.mul(10)
    }

    let cost = this.cost(x.add(amount).sub(1))
    if (player[this.layer].gem[this.id].lte(cost)) return
    if (freeCost) cost = 0
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
        },
        gemUpgrade: {
            11: [new Decimal(0), new Decimal(0), new Decimal(0)],
            12: [new Decimal(0), new Decimal(0), new Decimal(0)],
            13: [new Decimal(0), new Decimal(0), new Decimal(0)],
            14: [new Decimal(0), new Decimal(0), new Decimal(0)]
        }
    }},
    color: "#31aeb0",
    requires() {
        let base = new Decimal(1e200)
        if(hasUpgrade("g", 15)) {
            base = base.div(layers["g"].generatorCostBoost())
        }
        return base
    }, // Can be a function that takes requirement increases into account
    resource: "generator", // Name of prestige currency
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
        if(hasUpgrade("u", 1101)) mult = mult.mul(upgradeEffect("u", 1101)[1])
        if(hasUpgrade("g", 15)) mult = mult.mul(layers["g"].T1GemEffect())
        if (hasUpgrade("p", 31)) mult = mult.mul(clickableEffect("p", 14))
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
        if(hasUpgrade("g", 15)) mult = mult.mul(layers["g"].flowBoost())
        return mult
    },
    flowEffect() {
        let mult = player["g"].flow.add(1).pow(3)
        return mult
    },
    T1GemGain() {
        let mult = this.T1GemBoost()
        mult = mult.mul(layers["g"].T2GemEffect())
        mult = mult.mul(layers["g"].greatGemBoost())
        if(hasUpgrade("g", 21)) mult = mult.mul(upgradeEffect("g", 21))
        if(hasUpgrade("g", 23)) mult = mult.mul(upgradeEffect("g", 23))
        return mult
    },
    T1GemEffect() {
        return player["g"].gem[11].pow(0.5).add(1)
    },
    T2GemGain() {
        let mult = this.T2GemBoost()
        mult = mult.mul(layers["g"].T3GemEffect())
        mult = mult.mul(layers["g"].greatGemBoost())
        if(hasUpgrade("g", 21)) mult = mult.mul(upgradeEffect("g", 21))
        if(hasUpgrade("g", 23)) mult = mult.mul(upgradeEffect("g", 23))
        return mult
    },
    T2GemEffect() {
        return player["g"].gem[12].pow(0.5).add(1)
    },
    T3GemGain() {
        let mult = this.T3GemBoost()
        mult = mult.mul(layers["g"].T4GemEffect())
        mult = mult.mul(layers["g"].greatGemBoost())
        if(hasUpgrade("g", 21)) mult = mult.mul(upgradeEffect("g", 21))
        if(hasUpgrade("g", 23)) mult = mult.mul(upgradeEffect("g", 23))
        return mult
    },
    T3GemEffect() {
        return player["g"].gem[13].pow(0.5).add(1)
    },
    T4GemGain() {
        let mult = this.T4GemBoost()
        mult = mult.mul(layers["g"].greatGemBoost())
        if(hasUpgrade("g", 21)) mult = mult.mul(upgradeEffect("g", 21))
        if(hasUpgrade("g", 23)) mult = mult.mul(upgradeEffect("g", 23))
        return mult
    },
    T4GemEffect() {
        return player["g"].gem[14].pow(0.5).add(1)
    },
    boostBase(num=new Decimal(0)) {
        return num.mul(2).add(0.25).pow(0.5).sub(0.5)
    },
    T1GemBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[11][0].add(this.metaBoost()))
        return new Decimal(10).pow(value)
    },
    prestigeBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[11][1].add(this.metaBoost()))
        return new Decimal(5).pow(value)
    },
    boosterBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[11][2].add(this.metaBoost()))
        return new Decimal(0.1).mul(value)
    },
    T2GemBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[12][0].add(this.metaBoost()))
        let base = player["g"].gem[11].add(1).log10().add(1)
        return base.pow(value)
    },
    flowBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[12][1].add(this.metaBoost()))
        return new Decimal(3).pow(value)
    },
    metaBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[12][2])
        return new Decimal(1).mul(value)
    },
    T3GemBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[13][0])
        let base = player["g"].gem[12].add(1).log10().add(1)
        return base.pow(value)
    },
    colorBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[13][1])
        return new Decimal(5).pow(value)
    },
    treeCostBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[13][2])
        return new Decimal(1e20).pow(value)
    },
    T4GemBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[14][0])
        let base = player["g"].gem[13].add(1).log10().add(1)
        return base.pow(value)
    },
    generatorCostBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[14][1])
        return new Decimal(1000).pow(value)
    },
    greatGemBoost() {
        let value = this.boostBase(player["g"].gemUpgrade[14][2])
        return new Decimal(10).pow(value)
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
        if(getBuyableAmount(this.layer, 21).gte(1)) {
            player[this.layer].gem[12] = player[this.layer].gem[12].add(tmp.g.T2GemGain.mul(diff))
        }
        if(getBuyableAmount(this.layer, 21).gte(2)) {
            player[this.layer].gem[13] = player[this.layer].gem[13].add(tmp.g.T3GemGain.mul(diff))
        }
        if(getBuyableAmount(this.layer, 21).gte(3)) {
            player[this.layer].gem[14] = player[this.layer].gem[14].add(tmp.g.T4GemGain.mul(diff))
        }
        for(let id = 11; id < 15; id++) {
            if(hasUpgrade("g", 100 + id)) {
                this.buyables[id].buyMax(true)
            }
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
                ["row", [["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14], ["upgrade", 15]]],
                ["row", [["upgrade", 21], ["upgrade", 22], ["upgrade", 23], ["upgrade", 24], ["upgrade", 25]]]
            ],
        },
        "Gem": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                ["microtabs", "stuff", { 'border-width': '0px' }],
            ],
            unlocked() {
                return hasUpgrade("g", 15)
            },
        },
        "Mass": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "blank",
                ["display-text", function() {
                    return "Next Update!"
                }],
            ],
            unlocked() {
                return hasUpgrade("g", 25)
            },
        },
    },
    microtabs: {
        stuff: {
            Gem: {
                content: [
                    "blank",
                    ["row", [
                        ["display-text", 
                            function () { 
                                return "Tier 1 Gem : " + format(player[this.layer].gem[11]) + " (+" + format(tmp.g.T1GemGain) + "/s)" +
                                "<br>which multiples generator power gain by " + format(tmp.g.T1GemEffect)
                            },
                            {width: "400px", display: "inline-block"}
                        ],
                        ["buyable", 11]
                    ]],
                    "blank",
                    ["row", [
                        ["display-text", 
                            function () { 
                                if(getBuyableAmount(this.layer, 21).lt(1)) return ""
                                return "Tier 2 Gem : " + format(player[this.layer].gem[12]) + " (+" + format(tmp.g.T2GemGain) + "/s)" + 
                                "<br>which multiples tier 1 gem gain by " + format(tmp.g.T2GemEffect)
                            },
                            {width: "400px", display: "inline-block"}
                        ], 
                        ["buyable", 12]
                    ]],
                    "blank",
                    ["row", [
                        ["display-text", 
                            function () { 
                                if(getBuyableAmount(this.layer, 21).lt(2)) return ""
                                return "Tier 3 Gem : " + format(player[this.layer].gem[13]) + " (+" + format(tmp.g.T3GemGain) + "/s)" + 
                                "<br>which multiples tier 2 gem gain by " + format(tmp.g.T3GemEffect)
                            },
                            {width: "400px", display: "inline-block"}
                        ], 
                        ["buyable", 13]
                    ]],
                    "blank",
                    ["row", [
                        ["display-text", 
                            function () { 
                                if(getBuyableAmount(this.layer, 21).lt(3)) return ""
                                return "Tier 4 Gem : " + format(player[this.layer].gem[14]) + " (+" + format(tmp.g.T4GemGain) + "/s)" + 
                                "<br>which multiples tier 3 gem gain by " + format(tmp.g.T4GemEffect)
                            },
                            {width: "400px", display: "inline-block"}
                        ], 
                        ["buyable", 14]
                    ]],
                    "blank",
                    "blank",
                    ["buyable", 21]
                ]
            },
            Effect: {
                content: [
                    "blank",
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[11][0].eq(0)) return ""
                        return "Tier 1 Gem Boost [" + format(player[this.layer].gemUpgrade[11][0]) +
                        (player[this.layer].gemUpgrade[12][2].eq(0) ? "" : " + " + format(tmp.g.metaBoost)) + 
                        "] : Multiply Tier 1 Gem gain by " + format(tmp.g.T1GemBoost)
                    }],
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[11][1].eq(0)) return ""
                        return "Prestige Point Boost [" + format(player[this.layer].gemUpgrade[11][1]) + 
                        (player[this.layer].gemUpgrade[12][2].eq(0) ? "" : " + " + format(tmp.g.metaBoost)) + 
                        "] : Multiply prestige points gain by " + format(tmp.g.prestigeBoost)
                    }],
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[11][2].eq(0)) return ""
                        return "Booster Boost [" + format(player[this.layer].gemUpgrade[11][2]) + 
                        (player[this.layer].gemUpgrade[12][2].eq(0) ? "" : " + " + format(tmp.g.metaBoost)) + 
                        "] : Add booster power by " + format(tmp.g.boosterBoost.mul(100)) + "%"
                    }],
                    "blank",
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[12][0].eq(0)) return ""
                        return "Tier 2 Gem Boost [" + format(player[this.layer].gemUpgrade[12][0]) + 
                        (player[this.layer].gemUpgrade[12][2].eq(0) ? "" : " + " + format(tmp.g.metaBoost)) + 
                        "] : Multiply Tier 2 Gem gain by " + format(tmp.g.T2GemBoost) + " (based on Tier 1 Gem)"
                    }],
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[12][1].eq(0)) return ""
                        return "Generator Flow Boost [" + format(player[this.layer].gemUpgrade[12][1]) + 
                        (player[this.layer].gemUpgrade[12][2].eq(0) ? "" : " + " + format(tmp.g.metaBoost)) + 
                        "] : Multiply generator flow gain by " + format(tmp.g.flowBoost)
                    }],
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[12][2].eq(0)) return ""
                        return "Meta Boost [" + format(player[this.layer].gemUpgrade[12][2]) + 
                        "] : Add " + format(tmp.g.metaBoost) + " levels to all above boosts"
                    }],
                    "blank",
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[13][0].eq(0)) return ""
                        return "Tier 3 Gem Boost [" + format(player[this.layer].gemUpgrade[13][0]) +
                        "] : Multiply Tier 3 Gem gain by " + format(tmp.g.T3GemBoost) + " (based on Tier 2 Gem)"
                    }],
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[13][1].eq(0)) return ""
                        return "Color Boost [" + format(player[this.layer].gemUpgrade[13][1]) + 
                        "] : Multiply color gain by " + format(tmp.g.colorBoost)
                    }],
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[13][2].eq(0)) return ""
                        return "Tree Cost Boost [" + format(player[this.layer].gemUpgrade[13][2]) + 
                        "] : Divide tree point cost by " + format(tmp.g.treeCostBoost)
                    }],
                    "blank",
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[14][0].eq(0)) return ""
                        return "Tier 4 Gem Boost [" + format(player[this.layer].gemUpgrade[14][0]) +
                        "] : Multiply Tier 4 Gem gain by " + format(tmp.g.T4GemBoost) + " (based on Tier 3 Gem)"
                    }],
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[14][1].eq(0)) return ""
                        return "Generator Cost Boost [" + format(player[this.layer].gemUpgrade[14][1]) + 
                        "] : Divide generator cost by " + format(tmp.g.generatorCostBoost)
                    }],
                    ["display-text", function() {
                        if(player[this.layer].gemUpgrade[14][2].eq(0)) return ""
                        return "Great Gem Boost [" + format(player[this.layer].gemUpgrade[14][2]) + 
                        "] : Multiply Tier 1-4 Gem gain by " + format(tmp.g.greatGemBoost)
                    }],
                ]
            },
            Automation: {
                content: [
                    "blank",
                    ["row", [["upgrade", 111], ["upgrade", 112], ["upgrade", 113], ["upgrade", 114]]]
                ]
            }
        },
    },
    upgrades: {
        11: {
            title: "Generator Boost",
            description: "Generators boost upgrade point gain",
            cost: new Decimal(2),
            effect() {
                let value = player["g"].points.add(1).pow(5)
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
        },
        21: {
            title: "Gem Flow",
            description: "Generator flow boost all tier gems gain",
            cost: new Decimal(7),
            effect() {
                let value = player["g"].flow.add(1).log10().add(1)
                return value
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            unlocked() {
                return hasUpgrade("u", 63)
            }
        },
        22: {
            title: "Generate Upgrade Points",
            description: "Gain 100% of upgrade points gain every second.",
            cost: new Decimal(8),
            unlocked() {
                return hasUpgrade("u", 63)
            }
        },
        23: {
            title: "Color Gem",
            description: "Total color points boost all tier gems gain.",
            cost: new Decimal(9),
            effect() {
                let value = player["p"].colorPoint.add(player["p"].colors[0]).add(player["p"].colors[1]).add(player["p"].colors[2])
                return value.div(3).add(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade("u", 63)
            }
        },
        24: {
            title: "Generate Prestige Points",
            description: "Gain 100% of prestige points gain every second.",
            cost: new Decimal(11),
            unlocked() {
                return hasUpgrade("u", 63)
            }
        },
        25: {
            title: "New Type Generator Again",
            description: "Unlock mass tab.",
            cost: new Decimal(13),
            unlocked() {
                return hasUpgrade("u", 63)
            }
        },
        111: {
            title: "Auto Tier 1 Gem Upgrade",
            description: "Auto tier 1 gem upgrade without spending gem.",
            cost: new Decimal(1e20),
            currencyDisplayName: "tier 1 gem",
            currencyInternalName: "11",
            currencyLocation() {
                return player[this.layer].gem
            },
            canAfford() { return player[this.layer].gem[11].gte(this.cost) },
            pay() {
                player[this.layer].gem[11] = player[this.layer].gem[11].sub(this.cost)
            },
            unlocked() {
                return hasUpgrade("g", 15)
            }
        },
        112: {
            title: "Auto Tier 2 Gem Upgrade",
            description: "Auto tier 2 gem upgrade without spending gem.",
            cost: new Decimal(1e20),
            currencyDisplayName: "tier 2 gem",
            currencyInternalName: "12",
            currencyLocation() {
                return player[this.layer].gem
            },
            canAfford() { return player[this.layer].gem[12].gte(this.cost) },
            pay() {
                player[this.layer].gem[12] = player[this.layer].gem[12].sub(this.cost)
            },
            unlocked() {
                return hasUpgrade("g", 111)
            }
        },
        113: {
            title: "Auto Tier 3 Gem Upgrade",
            description: "Auto tier 3 gem upgrade without spending gem.",
            cost: new Decimal(1e20),
            currencyDisplayName: "tier 3 gem",
            canAfford() { return player[this.layer].gem[13].gte(this.cost) },
            pay() {
                player[this.layer].gem[13] = player[this.layer].gem[13].sub(this.cost)
            },
            unlocked() {
                return hasUpgrade("g", 112)
            }
        },
        114: {
            title: "Auto Tier 4 Gem Upgrade",
            description: "Auto tier 4 gem upgrade without spending gem.",
            cost: new Decimal(1e20),
            currencyDisplayName: "tier 4 gem",
            canAfford() { return player[this.layer].gem[14].gte(this.cost) },
            pay() {
                player[this.layer].gem[14] = player[this.layer].gem[14].sub(this.cost)
            },
            unlocked() {
                return hasUpgrade("g", 113)
            }
        },
    },
    buyables: {
        11: {
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(3)
                let cost = new Decimal(2).mul(value.pow(x))
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
                this.buyMulti(new Decimal(1), this.cost())
            },
            buyMulti(amount, cost) {
                if(!amount) return
                let index = getBuyableAmount(this.layer, this.id).toNumber() % 3
                let count = amount.toNumber() % 3
                let upgradeAmount = Math.floor(amount.div(3).toNumber())
                for(let i = index; i < index+3; i++) {
                    let idx = i % 3
                    if(count > 0) {
                        player[this.layer].gemUpgrade[this.id][idx] = player[this.layer].gemUpgrade[this.id][idx].add(upgradeAmount+1)
                        count--
                    } else {
                        player[this.layer].gemUpgrade[this.id][idx] = player[this.layer].gemUpgrade[this.id][idx].add(upgradeAmount)
                    }
                }
                player[this.layer].gem[this.id] = player[this.layer].gem[this.id].sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
            },
            buyMax : GemBuyMax,
            style: { width: '175px', height: '50px', borderRadius: '10px', "font-size": "16px" }
        },
        12: {
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(4)
                let cost = new Decimal(2).mul(value.pow(x))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                return value.pow(0.5)
            },
            display() { 
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + "\nTier 2 Gem"
            },
            canAfford() { return player[this.layer].gem[this.id].gte(this.cost()) },
            buy() {
                this.buyMulti(new Decimal(1), this.cost())
            },
            buyMulti(amount, cost) {
                if(!amount) return
                let index = getBuyableAmount(this.layer, this.id).toNumber() % 3
                let count = amount.toNumber() % 3
                let upgradeAmount = Math.floor(amount.div(3).toNumber())
                for(let i = index; i < index+3; i++) {
                    let idx = i % 3
                    if(count > 0) {
                        player[this.layer].gemUpgrade[this.id][idx] = player[this.layer].gemUpgrade[this.id][idx].add(upgradeAmount+1)
                        count--
                    } else {
                        player[this.layer].gemUpgrade[this.id][idx] = player[this.layer].gemUpgrade[this.id][idx].add(upgradeAmount)
                    }
                }
                player[this.layer].gem[this.id] = player[this.layer].gem[this.id].sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
            },
            buyMax : GemBuyMax,
            unlocked() {
                return getBuyableAmount(this.layer, 21).gte(1)
            },
            style: { width: '175px', height: '50px', borderRadius: '10px', "font-size": "16px" }
        },
        13: {
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(5)
                let cost = new Decimal(2).mul(value.pow(x))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                return value.pow(0.5)
            },
            display() { 
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + "\nTier 3 Gem"
            },
            canAfford() { return player[this.layer].gem[this.id].gte(this.cost()) },
            buy() {
                this.buyMulti(new Decimal(1), this.cost())
            },
            buyMulti(amount, cost) {
                if(!amount) return
                let index = getBuyableAmount(this.layer, this.id).toNumber() % 3
                let count = amount.toNumber() % 3
                let upgradeAmount = Math.floor(amount.div(3).toNumber())
                for(let i = index; i < index+3; i++) {
                    let idx = i % 3
                    if(count > 0) {
                        player[this.layer].gemUpgrade[this.id][idx] = player[this.layer].gemUpgrade[this.id][idx].add(upgradeAmount+1)
                        count--
                    } else {
                        player[this.layer].gemUpgrade[this.id][idx] = player[this.layer].gemUpgrade[this.id][idx].add(upgradeAmount)
                    }
                }
                player[this.layer].gem[this.id] = player[this.layer].gem[this.id].sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
            },
            buyMax : GemBuyMax,
            unlocked() {
                return getBuyableAmount(this.layer, 21).gte(2)
            },
            style: { width: '175px', height: '50px', borderRadius: '10px', "font-size": "16px" }
        },
        14: {
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                let value = new Decimal(6)
                let cost = new Decimal(2).mul(value.pow(x))
                return cost
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                return value.pow(0.5)
            },
            display() { 
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + "\nTier 4 Gem"
            },
            canAfford() { return player[this.layer].gem[this.id].gte(this.cost()) },
            buy() {
                this.buyMulti(new Decimal(1), this.cost())
            },
            buyMulti(amount, cost) {
                if(!amount) return
                let index = getBuyableAmount(this.layer, this.id).toNumber() % 3
                let count = amount.toNumber() % 3
                let upgradeAmount = Math.floor(amount.div(3).toNumber())
                for(let i = index; i < index+3; i++) {
                    let idx = i % 3
                    if(count > 0) {
                        player[this.layer].gemUpgrade[this.id][idx] = player[this.layer].gemUpgrade[this.id][idx].add(upgradeAmount+1)
                        count--
                    } else {
                        player[this.layer].gemUpgrade[this.id][idx] = player[this.layer].gemUpgrade[this.id][idx].add(upgradeAmount)
                    }
                }
                player[this.layer].gem[this.id] = player[this.layer].gem[this.id].sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
            },
            buyMax : GemBuyMax,
            unlocked() {
                return getBuyableAmount(this.layer, 21).gte(3)
            },
            style: { width: '175px', height: '50px', borderRadius: '10px', "font-size": "16px" }
        },
        21: {
            title : "Unlock New Tier Gem",
            cost(x=getBuyableAmount(this.layer, this.id)) { 
                if(getBuyableAmount(this.layer, this.id).eq(0)) return new Decimal(4e3)
                if(getBuyableAmount(this.layer, this.id).eq(1)) return new Decimal(4e4)
                if(getBuyableAmount(this.layer, this.id).eq(2)) return new Decimal(4e5)
                return new Decimal(1e100)
            },
            currency() {
                if(getBuyableAmount(this.layer, this.id).eq(0)) return 11
                if(getBuyableAmount(this.layer, this.id).eq(1)) return 12
                if(getBuyableAmount(this.layer, this.id).eq(2)) return 13
                if(getBuyableAmount(this.layer, this.id).eq(3)) return 14
                return 14
            },
            effect() {
                let value = getBuyableAmount(this.layer, this.id)
                return value.pow(0.5)
            },
            display() { 
                if(getBuyableAmount(this.layer, this.id).gte(3)) {
                    return "All Unlocked"
                }
                return "Require: " + format(tmp[this.layer].buyables[this.id].cost) + " Tier " + getBuyableAmount(this.layer, this.id).add(1) + " Gem"
            },
            canAfford() { 
                if(getBuyableAmount(this.layer, this.id).eq(4)) return false
                return player[this.layer].gem[this.currency()].gte(this.cost()) 
            },
            buy() {
                player[this.layer].gem = {
                    11: new Decimal(0),
                    12: new Decimal(0),
                    13: new Decimal(0),
                    14: new Decimal(0)
                }
                player[this.layer].gemUpgrade = {
                    11: [new Decimal(0), new Decimal(0), new Decimal(0)],
                    12: [new Decimal(0), new Decimal(0), new Decimal(0)],
                    13: [new Decimal(0), new Decimal(0), new Decimal(0)],
                    14: [new Decimal(0), new Decimal(0), new Decimal(0)]
                }
                for(let id = 11; id < 15; id++) {
                    setBuyableAmount(this.layer, id, new Decimal(0))
                }

                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: {height: '100px', borderRadius: '10px' }
        },
    }
})