addLayer("g", {
    name: "generator", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        power: new Decimal(0)
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
        return mult
    },
    effectDescription() { // Optional text to describe the effects
        return "which are generating " + format(this.effect()) + " generator power/sec"
    },
    powerEffect() {
        let value = player["g"].power.add(1).log10().add(1).pow(30)
        if(getClickableState("u", 72)) value = value.pow(clickableEffect("u", 72))
        return value
    },
    branches: ["u"],
    hotkeys: [
        {key: "g", description: "G: Reset for generator points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        player[this.layer].power = player[this.layer].power.add(tmp.g.effect.mul(diff))
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
                "blank",
                "blank",
                "upgrades"
            ],
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
        }
    }
})