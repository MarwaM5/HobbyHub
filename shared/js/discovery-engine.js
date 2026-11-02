/* Pure discovery rules: no DOM, persistence or network side effects. */
(function (root) {
  'use strict';
  function check(config) {
    if (config.schemaVersion !== 1 || typeof config.version !== 'string' || !config.version.trim())
      throw Error('Invalid configuration version.');
    if (!Array.isArray(config.questions) || !config.questions.length)
      throw Error('Add at least one question.');
    if (!Number.isInteger(config.maxFollowups) || config.maxFollowups < 0 || config.maxFollowups > 2)
      throw Error('The optional follow-up limit must be between zero and two.');
    const unique = (rows, name) => {
      const ids = new Set();
      for (const row of rows) {
        if (!row.id || ids.has(row.id)) throw Error('Missing or duplicate ID: ' + name);
        ids.add(row.id);
      }
      return ids;
    };
    const qids = unique(config.questions, 'questions'),
      hids = unique(config.hobbies, 'hobbies');
    unique(config.groups, 'groups');
    for (const q of config.questions) {
      if (!q.prompt?.trim() || !['rating', 'single', 'multi'].includes(q.type))
        throw Error('Invalid question type or text: ' + q.id);
      if (!['interest', 'context', 'followup'].includes(q.role)) throw Error('Invalid question role.');
      if (!Array.isArray(q.options) || q.options.length < 2) throw Error('A question needs options.');
      const ids = unique(q.options, 'options for ' + q.id);
      if (q.options.some((o) => !o.label?.trim())) throw Error('An option needs a label.');
      if ((q.exclusiveOptionIds || []).some((id) => !ids.has(id)))
        throw Error('An exclusive option does not exist.');
      if (q.type === 'multi' && ids.has('unknown') && !(q.exclusiveOptionIds || []).includes('unknown'))
        throw Error('Not sure must remain an exclusive choice.');
      if (q.role === 'interest' && q.type !== 'rating') throw Error('Interest prompts need a defined scale.');
      if (q.type === 'rating') {
        const scores = q.options.filter((o) => o.score !== null).map((o) => o.score);
        if (scores.length !== 3 || new Set(scores).size !== 3 || scores.some((v) => ![0, 2, 4].includes(v)))
          throw Error('Use interest scores 0, 2 and 4 with a separate null uncertainty option.');
        if (!q.options.some((o) => o.score === null)) throw Error('The uncertainty option is missing.');
      }
      if (q.role === 'followup') {
        const parent = config.questions.find((p) => p.id === q.when?.questionId);
        if (
          !parent ||
          parent.role !== 'interest' ||
          q.when.operator !== 'atLeast' ||
          !Number.isInteger(q.when.score) ||
          q.when.score < 0 ||
          q.when.score > 4
        )
          throw Error('Invalid follow-up condition; follow-ups cannot depend on other follow-ups.');
        if (q.required) throw Error('Follow-ups must be optional in this experiment.');
      }
    }
    const covered = new Set();
    for (const g of config.groups) {
      if (
        !g.label?.trim() ||
        !qids.has(g.anchor) ||
        config.questions.find((q) => q.id === g.anchor).role !== 'interest'
      )
        throw Error('Invalid group anchor.');
      if (
        !g.hobbyIds?.length ||
        new Set(g.hobbyIds).size !== g.hobbyIds.length ||
        g.hobbyIds.some((id) => !hids.has(id))
      )
        throw Error('Invalid hobby mapping.');
      g.hobbyIds.forEach((id) => covered.add(id));
      if (g.followupId) {
        const f = config.questions.find((q) => q.id === g.followupId);
        if (
          f?.role !== 'followup' ||
          f.when.questionId !== g.anchor ||
          f.options.some((o) => o.id !== 'unknown' && !g.hobbyIds.includes(o.id))
        )
          throw Error('Invalid follow-up mapping.');
      }
    }
    if ([...hids].some((id) => !covered.has(id))) throw Error('Some hobbies have no mapping.');
    for (const hobby of config.hobbies) {
      const p = hobby.recommendation;
      if (!p || !qids.has(p.anchor) || config.questions.find((q) => q.id === p.anchor).role !== 'interest')
        throw Error('Missing or invalid hobby interest mapping.');
      if (
        !Array.isArray(p.support) ||
        p.support.some((id) => !qids.has(id) || config.questions.find((q) => q.id === id).role !== 'interest')
      )
        throw Error('Invalid secondary interest mapping.');
      if (
        !Array.isArray(p.patterns) ||
        p.patterns.some((id) => !['regular', 'occasional', 'trip'].includes(id))
      )
        throw Error('Invalid practice pattern.');
      if (
        typeof p.homeStartPossible !== 'boolean' ||
        typeof p.sharedPractice !== 'boolean' ||
        typeof p.competitiveGame !== 'boolean' ||
        typeof p.extendedFirstExperience !== 'boolean'
      )
        throw Error('Invalid practical characteristics.');
    }
    return true;
  }
  function validateAnswers(config, answers) {
    for (const [id, value] of Object.entries(answers)) {
      const q = config.questions.find((q) => q.id === id);
      if (!q) throw Error('Answer for a missing question: ' + id);
      if (value === null) continue;
      const values = q.type === 'multi' ? value : [value];
      if (
        !Array.isArray(values) ||
        !values.length ||
        new Set(values).size !== values.length ||
        values.some((v) => !q.options.some((o) => o.id === v))
      )
        throw Error('Invalid answer: ' + id);
      if (values.length > 1 && values.some((v) => (q.exclusiveOptionIds || []).includes(v)))
        throw Error('Do not combine Not sure with another choice.');
    }
  }
  function value(config, answers, id) {
    const q = config.questions.find((q) => q.id === id);
    return q?.options.find((o) => o.id === answers[id])?.score ?? null;
  }
  function followups(config, answers) {
    validateAnswers(config, answers);
    return config.questions
      .filter(
        (q) =>
          q.role === 'followup' &&
          value(config, answers, q.when.questionId) !== null &&
          value(config, answers, q.when.questionId) >= q.when.score,
      )
      .sort(
        (a, b) =>
          value(config, answers, b.when.questionId) - value(config, answers, a.when.questionId) ||
          a.id.localeCompare(b.id),
      )
      .slice(0, config.maxFollowups);
  }
  function rank(config, answers) {
    check(config);
    validateAnswers(config, answers);
    const interests = config.questions.filter((q) => q.role === 'interest');
    const allUnknown = interests.every((q) => value(config, answers, q.id) === null);
    const answerList = (id) => (Array.isArray(answers[id]) ? answers[id] : []);
    const selectedPatterns = answerList('C02').filter((v) => v !== 'unknown');
    const selectedPlaces = answerList('C04').filter((v) => v !== 'unknown');
    const selectedSocial = answerList('C05').filter((v) => v !== 'unknown');
    const candidates = config.hobbies.flatMap((hobby) => {
      const p = hobby.recommendation;
      if (!p) return [];
      const interest = value(config, answers, p.anchor);
      // A secondary preference can never resurrect an explicitly rejected interest.
      if (interest === null || interest < 2) return [];
      const positiveSupport = p.support.filter((id) => (value(config, answers, id) ?? 0) >= 2);
      const support =
        positiveSupport.reduce((n, id) => n + value(config, answers, id) / 4, 0) /
        Math.max(1, p.support.length);
      const matches = [],
        conflicts = [],
        notes = [];
      if (selectedPlaces.length === 1 && selectedPlaces[0] === 'home') {
        if (p.homeStartPossible)
          matches.push({
            questionId: 'C04',
            text: 'This can have an at-home starting route, subject to the tools and space you can access.',
          });
        else
          conflicts.push({
            questionId: 'C04',
            text: 'You selected an at-home start. The proposed first experience needs an outside location; check whether you would consider that.',
          });
      } else if (selectedPlaces.some((v) => v === 'near' || v === 'travel') && !p.homeStartPossible)
        matches.push({
          questionId: 'C04',
          text: 'You are open to starting outside home; the actual location and travel still need checking.',
        });
      if (selectedPatterns.length) {
        if (selectedPatterns.some((v) => p.patterns.includes(v)))
          matches.push({
            questionId: 'C02',
            text: 'You can try this with the kind of hobby schedule you chose.',
          });
        else
          conflicts.push({
            questionId: 'C02',
            text: 'You may need a different schedule to try this than the one you chose.',
          });
      }
      if (answers.C01 === 'short') {
        if (p.extendedFirstExperience)
          conflicts.push({
            questionId: 'C01',
            text: 'A first session or outing may exceed your 15-minute window. Check an actual activity duration before choosing it.',
          });
        else
          notes.push(
            'Short practice may be possible, but your selected session length is not a promise to finish a project.',
          );
      } else if (answers.C01 === 'half' && p.extendedFirstExperience)
        conflicts.push({
          questionId: 'C01',
          text: 'The proposed session or outing may exceed 30 minutes; its actual duration needs checking.',
        });
      if (answers.C06 === 'none' && p.competitiveGame)
        conflicts.push({
          questionId: 'C06',
          text: 'You prefer no competition. The game itself is competitive; a skills-only lesson is a different starting experience, not a non-competitive match.',
        });
      else if (answers.C06 === 'none' && !p.competitiveGame)
        matches.push({
          questionId: 'C06',
          text: 'There is a way to explore this without a competitive match.',
        });
      else if (['friendly', 'serious'].includes(answers.C06) && p.competitiveGame)
        matches.push({
          questionId: 'C06',
          text: 'Its game format can provide the competition you are open to; check the event level.',
        });
      if (selectedSocial.length === 1 && selectedSocial[0] === 'solo' && p.sharedPractice)
        conflicts.push({
          questionId: 'C05',
          text: 'You selected solo participation. This proposed practice normally involves other participants.',
        });
      else if (selectedSocial.some((v) => v === 'group' || v === 'pair') && p.sharedPractice)
        matches.push({
          questionId: 'C05',
          text: 'You can take part with other people, as you prefer.',
        });
      if (hobby.id === 'camping')
        notes.push('Camping may include staying overnight; check whether you actually want that experience.');
      if (hobby.id === 'homeGardening')
        notes.push(
          'Plant care can be needed on different days; time spent caring is different from time needed for growth.',
        );
      if (['snorkeling', 'swimming', 'windsurfing'].includes(hobby.id))
        notes.push('Before booking, check whether the session suits your swimming ability and experience.');
      if (hobby.id === 'groupBoardGames' && answers.C06 === 'none')
        notes.push(
          'Choose a specifically described cooperative game, not an unspecified board-game session.',
        );
      const question = config.questions.find((q) => q.id === p.anchor),
        option = question.options.find((o) => o.id === answers[p.anchor]);
      return [
        {
          hobbyId: hobby.id,
          hobbyIds: [hobby.id],
          label: hobby.displayName || hobby.name,
          interest,
          support,
          contextMatches: matches.length,
          conflictCount: conflicts.length,
          reason: 'You answered “' + option.label + '” to “' + question.prompt + '”.',
          supportReasons: positiveSupport.map((id) => ({
            questionId: id,
            text: config.questions.find((q) => q.id === id).prompt,
          })),
          matches,
          conflicts,
          notes,
          trace: {
            primaryQuestion: p.anchor,
            primaryAnswer: answers[p.anchor],
            secondaryQuestions: positiveSupport,
            contextMatched: matches.map((x) => x.questionId),
            contextConflicted: conflicts.map((x) => x.questionId),
          },
        },
      ];
    });
    // Do not fill the third slot with a weaker interest just to reach a target count.
    const strong = candidates.filter((c) => c.interest === 4);
    const pool = strong.length ? strong : candidates;
    const compare = (a, b) =>
      b.interest - a.interest ||
      a.conflictCount - b.conflictCount ||
      b.contextMatches - a.contextMatches ||
      b.support - a.support;
    pool.sort((a, b) => compare(a, b) || a.hobbyId.localeCompare(b.hobbyId));
    const results = pool.slice(0, 3);
    const tied =
      results.some((a, i) => results.some((b, j) => i !== j && compare(a, b) === 0)) ||
      (pool.length > 3 && compare(pool[2], pool[3]) === 0);
    return {
      version: config.version,
      status: results.length ? 'explore' : allUnknown ? 'insufficient' : 'no-clear-interest',
      results,
      tied,
      evidence: strong.length ? 'explicit-interest' : 'tentative-interest',
      budget: answers.C03 || null,
      budgetNote:
        answers.C03 === 'zero'
          ? 'You prefer a first try with no new spending. Check whether you can use the equipment and location for free; lessons, entry and travel may cost extra.'
          : answers.C03 === 'unknown'
            ? 'You have not decided on a budget. Compare actual costs before choosing a first experience.'
            : answers.C03
              ? 'Your interests guide these suggestions. Before you start, check equipment, access and lesson costs against your chosen budget. Class prices are shown separately.'
              : null,
    };
  }
  const api = Object.freeze({ check, validateAnswers, value, followups, rank });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HHDiscoveryEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
