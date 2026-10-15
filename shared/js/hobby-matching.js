/* Shared recommendation calculation. Option values remain stable when reordered. */
const HobbyMatching = Object.freeze({
  rank(hobbyRows, questions, answers) {
    const weights = {
      environment: 1.5,
      social: 1.5,
      activityType: 1,
      time: 1,
      cost: 1.5,
      energy: 1,
      competitive: 1,
      purpose: 1,
      equipment: 1,
      learning: 1,
      learningCurve: 1,
      weekend: 1,
    };
    const bonus = {
      activityType: [
        ['creative', 'foodHome'],
        ['sportsFitness', 'outdoorAdventure'],
        ['musicDance', 'creative'],
        ['gamesMind', 'foodHome'],
      ],
      weekend: [
        ['creative'],
        ['outdoorAdventure'],
        ['sportsFitness'],
        ['foodHome'],
        ['gamesMind'],
        ['musicDance'],
      ],
    };
    const activeDimensions = new Set(questions.map((q) => q.dimension));
    const max = Math.max(
      1,
      Object.entries(weights)
        .filter(([key]) => activeDimensions.has(key))
        .reduce((sum, [, weight]) => sum + weight, 0) +
        ['activityType', 'weekend'].filter((key) => activeDimensions.has(key)).length * 1.5,
    );
    return hobbyRows
      .map((h) => {
        let score = 0;
        for (const [dimension, weight] of Object.entries(weights)) {
          const chosen = questions
            .filter((q) => q.dimension === dimension && answers[q.id] !== undefined)
            .map((q) => q.options.find((o) => o.id === answers[q.id]))
            .filter(Boolean);
          if (!chosen.length || !h.quizProfile) continue;
          score +=
            chosen.reduce((sum, option) => {
              const distance = Math.abs(Number(h.quizProfile[dimension]) - Number(option.value));
              return sum + (distance === 0 ? weight : distance === 1 ? weight * 0.5 : 0);
            }, 0) / chosen.length;
        }
        for (const dimension of ['activityType', 'weekend']) {
          const chosen = questions
            .filter((q) => q.dimension === dimension && answers[q.id] !== undefined)
            .map((q) => q.options.find((o) => o.id === answers[q.id]))
            .filter(Boolean);
          if (chosen.length)
            score +=
              chosen.reduce(
                (sum, o) =>
                  sum + ((bonus[dimension][Number(o.value)] || []).includes(h.categoryId) ? 1.5 : 0),
                0,
              ) / chosen.length;
        }
        return { ...h, score, match: Math.round((score / max) * 100) };
      })
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 3);
  },
});
