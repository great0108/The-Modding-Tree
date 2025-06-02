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
                ["infobox", "color"],
            ],
        },
    },
    infoboxes: {
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
            body() { return "Find the each setting that maximize points and upgrade points similarly. Recommend 11, 21, 31, 41, 51, 61, 42 for points and 11, 22, 32, 21, 31, 43, 53, 62 for upgrade points. Don't forget to change selection setting when you change tree upgrades. You may buy 42 (Buyable Power 4) to make buyables cheaper. When you have 22 tree point, you can unlock next layer purchasing only the left upgrades of the tree." },
            unlocked() { return hasUpgrade("u", 45) || player["p"].unlocked}
        },
        lateTree: {
            title: "Late Tree",
            body() { return "Find the each setting that maximize points and upgrade points similarly. Recommend 11, 21, 31, 41, 51, 61, 42 for points and 11, 22, 32, 21, 31, 43, 53, 62 for upgrade points. Don't forget to change selection setting when you change tree upgrades. You may buy 42 (Buyable Power 4) to make buyables cheaper. When you have 22 tree point, you can unlock next layer purchasing only the left upgrades of the tree." },
            unlocked() { return hasUpgrade("u", 45) || player["p"].unlocked}
        },
        earlyMilestone: {
            title: "Early Milestone",
            body() { return "" },
        },
        lateMilestone: {
            title: "Late Milestone",
            body() { return "" },
        },
        spell: {
            title: "Spell",
            body() { return "" },
        },
        color: {
            title: "Color",
            body() { return "Next Update" },
        }
    },
}, 
)