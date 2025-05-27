addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        milestoneCond : []
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
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    effect() {
        return player["p"].points.add(1).log10().mul(2).add(1).pow(5)
    },
    effectDescription() { // Optional text to describe the effects
        eff = this.effect()
        return "which are boosting points and upgrade points by "+format(this.effect())
    },
    branches: ["u"],
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    onPrestige(gain) {
        let count = 0
        for(let i = 1; i < 4; i++) {
            for(let j = 1; j < 5; j++) {
                let id = i * 10 + j
                if (hasUpgrade("u", id)) {
                    count += 1
                }
            }
        }
        if(count <= 14) player[this.layer].milestoneCond.push(1)
    },
    unlocked() {
        return hasUpgrade("u", 1061)
    },
    layerShown() {
        return hasUpgrade("u", 1061) || player["p"].unlocked
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "milestones",
                "blank",
                "blank",
                "upgrades"
            ],
        },
    },
    // keep upgrade, auto buyable, keep selection, keep tree, auto tree point
    milestones: {
        1: {
            requirementDescription: "prestige with 14 or fewer upgrades in upgrades tab",
            effectDescription: "Keep upgrades in upgrades tab on reset.",
            done() { 
                return player[this.layer].milestoneCond.includes(1)
            }
        }
    },
    upgrades: {
        unlocked() {
            return hasUpgrade("u", 51)
        },
        11: {
            title: "Game Start",
            description: "Gain 1 point per second.",
            cost: new Decimal(100)
        },
        12: {
            title: "Bonus Point",
            description: "Gain another 1 point per second.",
            cost: new Decimal(200),
        },
        13: {
            title: "Double Point",
            description: "Point gain is doubled.",
            cost: new Decimal(300),
        },
        14: {
            title: "Self Synergy",
            description: "Boost point gain based on itself.",
            cost: new Decimal(500),
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
            cost: new Decimal(1000),
            effect() {
                return Decimal.log10(player[this.layer].points.add(1)).add(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            }, 
        },
    }
})