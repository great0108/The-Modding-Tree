addLayer("g", {
    name: "generator", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#31aeb0",
    requires() {return new Decimal(1e200)}, // Can be a function that takes requirement increases into account
    resource: "generator points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.1, // Prestige currency exponent
    base: new Decimal(1e20),
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    effect() {
        let mult = new Decimal(1)
        return mult
    },
    branches: ["u"],
    hotkeys: [
        {key: "g", description: "G: Reset for generator points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
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
                    return "Wait for next update!"
                }],
            ],
        },
    },
    upgrades: {
        11: {
            title: "Boost prestige",
            description: "Boost prestige point gain based on points.",
            cost: new Decimal(10),
            effect() {
                value = Decimal.log10(player.points.add(1)).div(20).add(1)
                return value
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
            unlocked() {
                return hasUpgrade("u", 51)
            }
        }
    }
})