const STICKER_PACKS = {
  default: {
    name: "Милые стикеры",
    stickers: [
      { id: "love_1", emoji: "❤️", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "love_2", emoji: "💕", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "kiss_1", emoji: "💋", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "hug_1", emoji: "🤗", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "miss_1", emoji: "🥺", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "star_1", emoji: "✨", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "flower_1", emoji: "🌸", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "fire_1", emoji: "🔥", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "moon_1", emoji: "🌙", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "sun_1", emoji: "☀️", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "butterfly_1", emoji: "🦋", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
      { id: "rainbow_1", emoji: "🌈", url: "https://www.pngall.com/wp-content/uploads/12/Heart-Emoji-PNG-Image.png" },
    ],
  },
};

export function getStickerPacks() {
  return STICKER_PACKS;
}

export function getStickerById(id) {
  for (const pack of Object.values(STICKER_PACKS)) {
    const sticker = pack.stickers.find((s) => s.id === id);
    if (sticker) return sticker;
  }
  return null;
}
