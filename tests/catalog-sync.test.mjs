import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import {
  GAME_SKIN_CATALOG,
  resolveCatalogItemName,
  synchronizeSkins,
  synchronizeWebsiteData,
} from "../src/gameSkinCatalog.ts"

const WEBSITE_ITEMS = [
  "AK-47",
  "AUG",
  "AWP",
  "Butterfly Knife",
  "Desert Eagle",
  "Driver Gloves",
  "Dual Berettas",
  "FAMAS",
  "Five-SeveN",
  "Flip Knife",
  "Galil AR",
  "Glock-18",
  "Gut Knife",
  "Handwraps",
  "Karambit",
  "M4A1-S",
  "M4A4",
  "M9 Bayonet",
  "MAC-10",
  "MP9",
  "Negev",
  "Nova",
  "Operator Gloves",
  "P250",
  "P90",
  "SG 553",
  "Skeleton Knife",
  "Sports Gloves",
  "SSG 08",
  "Stiletto Knife",
  "Tec-9",
  "USP-S",
  "XM1014",
]

function parseLiveCatalog(text) {
  const sections = new Map()
  let current = null

  for (const line of text.split(/\r?\n/)) {
    const header = line.match(/^(.+?) \((\d+)\)$/)
    if (header) {
      current = []
      sections.set(header[1], current)
    } else if (current && line.startsWith("  ")) {
      current.push(line.slice(2))
    }
  }

  return sections
}

test("catalog exactly mirrors every live skin for the existing website items", async () => {
  const snapshot = await readFile(
    new URL("../../LIVE_GAME_SKIN_CATALOG.txt", import.meta.url),
    "utf8",
  )
  const liveCatalog = parseLiveCatalog(snapshot)
  const resolvedItems = WEBSITE_ITEMS.map(resolveCatalogItemName).sort()

  assert.deepEqual(Object.keys(GAME_SKIN_CATALOG).sort(), resolvedItems)
  for (const itemName of resolvedItems) {
    const expected = [...liveCatalog.get(itemName)].sort((a, b) =>
      a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }),
    )
    assert.deepEqual(GAME_SKIN_CATALOG[itemName], expected, itemName)
  }
})

test("legacy labels become exact game names while retaining their existing images", () => {
  const placeholder = "placeholder.svg"
  const result = synchronizeSkins(
    "Butterfly Knife",
    [
      { name: "Nebula Phase1", img: "phase1.png" },
      { name: "Nebula Phase2", img: "phase2.png" },
      { name: "Nebula Phase3", img: "phase3.png" },
      { name: "Nebula Phase4", img: "phase4.png" },
      { name: "Nebula Ruby", img: "ruby.png" },
      { name: "Nebula Sapphire", img: "sapphire.png" },
      { name: "Nebula Black Pearl", img: "black-pearl.png" },
    ],
    placeholder,
  )

  assert.equal(
    result.find((skin) => skin.name === "Nebula_PATTERN_1")?.img,
    "phase1.png",
  )
  assert.equal(
    result.find((skin) => skin.name === "Nebula_PATTERN_5")?.img,
    "ruby.png",
  )
  assert.equal(
    result.find((skin) => skin.name === "Nebula_PATTERN_6")?.img,
    "sapphire.png",
  )
  assert.equal(
    result.find((skin) => skin.name === "Nebula_PATTERN_7")?.img,
    "black-pearl.png",
  )
  assert.equal(
    result.find((skin) => skin.name === "Nebula_PATTERN_8")?.img,
    placeholder,
  )
  assert.deepEqual(
    result.map((skin) => skin.name),
    GAME_SKIN_CATALOG["Butterfly Knife"],
  )
})

test("readable labels keep exact game names for export", () => {
  const karambit = synchronizeSkins("Karambit", [], "placeholder.svg")
  const nova = synchronizeSkins("Nova", [], "placeholder.svg")
  const usp = synchronizeSkins("USP-S", [], "placeholder.svg")

  assert.deepEqual(
    karambit.find((skin) => skin.name === "Nebula_PATTERN_5"),
    {
      name: "Nebula_PATTERN_5",
      displayName: "Nebula Phase 5",
      img: "placeholder.svg",
    },
  )
  assert.equal(
    karambit.find((skin) => skin.name === "Viridian_PATTERN_9")?.displayName,
    "Viridian Phase 9",
  )
  assert.equal(
    nova.find((skin) => skin.name === "Half+One")?.displayName,
    "Half + One",
  )
  assert.equal(
    usp.find((skin) => skin.name === "SuperSoaked")?.displayName,
    "Super Soaked",
  )
})

test("known spelling aliases export the exact internal game folder names", () => {
  const placeholder = "placeholder.svg"

  assert.equal(
    synchronizeSkins(
      "Handwraps",
      [{ name: "Camoflage", img: "camo.png" }],
      placeholder,
    ).find((skin) => skin.img === "camo.png")?.name,
    "Camouflage",
  )
  assert.equal(
    synchronizeSkins(
      "Nova",
      [{ name: "Half Tone", img: "halftone.png" }],
      placeholder,
    ).find((skin) => skin.img === "halftone.png")?.name,
    "Half+One",
  )
  assert.equal(
    synchronizeSkins(
      "Tec-9",
      [{ name: "Medal", img: "medal.png" }],
      placeholder,
    ).find((skin) => skin.img === "medal.png")?.name,
    "Medal.tv",
  )
  assert.equal(resolveCatalogItemName("Handwraps"), "Hand Wraps")
})

test("stock can be omitted when the website already injects a stock tile", () => {
  const result = synchronizeSkins("AK-47", [], "placeholder.svg", {
    omitStock: true,
  })

  assert.equal(
    result.some((skin) => skin.name === "Stock"),
    false,
  )
  assert.deepEqual(
    result.map((skin) => skin.name),
    GAME_SKIN_CATALOG["AK-47"].filter((name) => name !== "Stock"),
  )
})

test("numbered pattern variants are ordered numerically", () => {
  const butterfly = GAME_SKIN_CATALOG["Butterfly Knife"]

  assert.deepEqual(
    butterfly.filter((name) => name.startsWith("Nebula_PATTERN_")),
    Array.from({ length: 11 }, (_, index) => `Nebula_PATTERN_${index + 1}`),
  )
  assert.deepEqual(
    butterfly.filter((name) => name.startsWith("Viridian_PATTERN_")),
    Array.from({ length: 9 }, (_, index) => `Viridian_PATTERN_${index + 1}`),
  )
})

test("website data is synchronized without adding items", () => {
  const placeholder = "placeholder.svg"
  const data = {
    pistols: { label: "PISTOLS", weapons: [] },
    midTier: { label: "MID-TIER", weapons: [] },
    rifles: {
      label: "RIFLES",
      weapons: [
        {
          name: "AK-47",
          img: "ak.png",
          skins: [{ name: "Aniki", img: "aniki.png" }],
          variants: [
            {
              name: "M4A4",
              img: "m4a4.png",
              skins: [{ name: "B-Hop", img: "bhop.png" }],
            },
          ],
        },
      ],
    },
    knifeTypes: [
      {
        name: "Butterfly Knife",
        img: "butterfly.png",
        skins: [{ name: "Fade", img: "fade.png" }],
      },
    ],
    glovesTypes: [
      {
        name: "Handwraps",
        img: "wraps.png",
        skins: [{ name: "Camoflage", img: "camo.png" }],
      },
    ],
  }

  synchronizeWebsiteData(data, placeholder)

  assert.equal(data.rifles.weapons.length, 1)
  assert.equal(data.rifles.weapons[0].variants.length, 1)
  assert.equal(data.knifeTypes.length, 1)
  assert.equal(data.glovesTypes.length, 1)
  assert.equal(data.glovesTypes[0].name, "Hand Wraps")
  assert.equal(
    data.rifles.weapons[0].skins.some((skin) => skin.name === "Stock"),
    false,
  )
  assert.equal(
    data.rifles.weapons[0].skins.find((skin) => skin.name === "Aniki")?.img,
    "aniki.png",
  )
  assert.equal(
    data.rifles.weapons[0].skins.find((skin) => skin.name === "Sovapid")?.img,
    placeholder,
  )
  assert.equal(
    data.glovesTypes[0].skins.find((skin) => skin.name === "Camouflage")?.img,
    "camo.png",
  )
})
