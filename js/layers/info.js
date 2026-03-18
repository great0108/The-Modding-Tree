addLayer("i", {
    startData() { return {
        unlocked: true,
    }},
    color: "lightgreen",
    row: "side",
    layerShown() {return true}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Info")
    },
    tabFormat: {
        "Upgrade Layer": {
            content: [
                ["infobox", "general"],
                "blank",
                "blank",
                ["infobox", "upgrades"],
                "blank",
                "blank",
                ["infobox", "buyables"],
                "blank",
                "blank",
                ["infobox", "selection"],
                "blank",
                "blank",
                ["infobox", "earlyTree"],
                "blank",
                "blank",
                ["infobox", "lateTree"],
            ],
        },
        "Prestige Layer": {
            unlocked() { return player["p"].unlocked},
            content: [
                ["infobox", "earlyMilestone"],
                "blank",
                "blank",
                ["infobox", "lateMilestone"],
                "blank",
                "blank",
                ["infobox", "spell"],
                "blank",
                "blank",
                ["infobox", "earlyColor"],
                "blank",
                "blank",
                ["infobox", "lateColor"],
            ],
        },
    },
    infoboxes: {
        general: {
            title: "General",
            body() { return "To simplify the notation of upgrades, upgrades are specified by listing rows and columns. For example, upgrade 14 is the upgrade in the fourth column of the first row." },
        },
        upgrades: {
            title: "Upgrades",
            body() { return "Just collect upgrade points and buy upgrades. You can hold down U to get upgrade points fast." },
        },
        buyables: {
            title: "Buyables",
            body() { return "Just collect upgrade points and buy buyables and upgrades similarly. Dont forget the first two buyables need points instead of upgrade points." },
            unlocked() { return hasUpgrade("u", 25) || player["p"].unlocked}
        },
        selection: {
            title: "Selection",
            body() { return "Find the each setting that maximize points and upgrade points. Recommend 11, 21, 31, 33, 43, 53 for points and 12, 22, 23, 33, 42, 52 for upgrade points. But this setting may not be optimal in the early selection stage." },
            unlocked() { return hasUpgrade("u", 35) || player["p"].unlocked}
        },
        earlyTree: {
            title: "Early Tree",
            body() { return "Find the each setting that maximize points and upgrade points similarly. Recommend 11, 21, 31, 41, 51, 61 for points and 11, 22, 32, 21, 31, 43 for upgrade points. Don't forget to set selection when you change tree upgrades. You may buy 42 (Buyable Power 4) to make buyables cheaper." },
            unlocked() { return hasUpgrade("u", 45) || player["p"].unlocked}
        },
        lateTree: {
            title: "Late Tree",
            body() { return "After 17 tree points, 11, 21, 31, 41, 51, 61, 42 for points and 11, 22, 32, 43, 53, 61, 21, 31 for upgrade points. To reach 2e71 points, You may change selection 43 to 42. When you have 22 tree point, You can unlock next layer purchasing only the left upgrades of the tree." },
            unlocked() { return hasUpgrade("u", 45) || player["p"].unlocked}
        },
        earlyMilestone: {
            title: "Early Milestone",
            body() { return "After you have over 10 prestige points, You can get milestone 1 without upgrades 12, 13, 23, 24, 31. Then buy upgrade 51 and prestige upgrades. After buying prestige upgrade 12, You can get milestone 2." },
            unlocked() { return player["p"].unlocked}
        },
        lateMilestone: {
            title: "Late Milestone",
            body() { return "Third milestone is achieved naturally when you buy prestige upgrade 13. You can get fourth milestone easily with over 1e8 prestige points. You also unlock sixth selection row. Recommend selection 62 for upgrade points and change to 63 just before getting the prestige points." },
            unlocked() { return hasMilestone("p", 2)}
        },
        spell: {
            title: "Spell",
            body() { return "Activate first two spells and farm upgrade points. Then activate third spell and get prestige points. Don't forget to change selection between farming upgrade points and getting prestige points. If you don't have enough upgrade points, You can farm magic by activating the spell multiple times. Selection 61 is better than 62 after buying prestige upgrade 21." },
            unlocked() { return hasUpgrade("p", 15)}
        },
        earlyColor: {
            title: "Early Color",
            body() { return "Start with all blue until 6 color points. Half green and half blue setting makes color points cheaper. After 6 color points, assign 3 blue, and the rest for red. At 9 color points, all green and the rest for blue setting is the more powerful." },
            unlocked() { return hasUpgrade("p", 23)}
        },
        lateColor: {
            title: "Late Color",
            body() { return "After 13 color points, assign 6 blue, 6 red and the rest for green. Don't forget to change to cheap color points setting. If you fill up the green, allocate the remaining points to red. After 25 color points, assigning 9 blue and 9 red makes color points more cheaper. Collect at least 29 color points and then buy remaining upgrades. If you are short on points, farming magic by spamming the spell." },
            unlocked() { return hasUpgrade("p", 23)}
        }
    },
}, 
)