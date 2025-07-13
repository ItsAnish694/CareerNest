export function calculateJobMatchScores(jobs = [], user) {
  if (!user || !Array.isArray(jobs)) return [];

  return jobs.map((job) => {
    const totalSkills = job.requiredSkills || [];
    const userSkills = user.skills || [];

    const matchedSkills = userSkills.filter((skill) =>
      totalSkills.includes(skill)
    );
    const skillMatchedPercent =
      (matchedSkills.length / totalSkills.length) * 100 || 0;

    let requiredExp = Number(job.requiredExperience?.split(" ")[0]) || 0;
    let userExp = Number(user.experiencedYears?.split(" ")[0]) || 0;

    if (requiredExp === 0 && userExp === 0) {
      requiredExp = 1;
      userExp = 1;
    }

    const experiencedMatchedPercent =
      userExp > requiredExp ? 100 : (userExp / requiredExp) * 100;

    const districtMatched =
      user.district === job.companyInfo?.companyLocation?.district ? 100 : 0;
    const cityMatched =
      user.city === job.companyInfo?.companyLocation?.city ? 100 : 0;
    const areaMatched =
      user.area === job.companyInfo?.companyLocation?.area ? 100 : 0;

    const totalMatchedScore =
      skillMatchedPercent * 0.6 +
      experiencedMatchedPercent * 0.31 +
      districtMatched * 0.03 +
      cityMatched * 0.03 +
      areaMatched * 0.03;

    return {
      ...job,
      totalMatchedScore: Math.floor(totalMatchedScore),
    };
  });
}
