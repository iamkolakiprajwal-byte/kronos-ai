import { decomposeGoalIntoRoadmap } from "../../src/lib/ai/roadmap";

async function runRoadmapTests() {
  console.log("=================================================");
  console.log("KRONOS AI ROADMAP DECOMPOSITION TEST SUITE");
  console.log("=================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // Test 1: Academic goal decomposition
  const academicRoadmap = await decomposeGoalIntoRoadmap({
    title: "Master Econometrics & Pass Final Exam with A+",
    description: "Stanford ECON 201 comprehensive preparation",
    category: "academic",
    targetDate: "2026-12-15",
  });

  assert(academicRoadmap.length === 3, "Academic goal decomposed into 3 chronological phases");
  assert(Boolean(academicRoadmap[0].actionableTasks?.length), "Phase 1 contains actionable daily tasks");
  assert(academicRoadmap[0].actionableTasks![0].durationMinutes > 0, "Actionable tasks have positive duration");

  // Test 2: Skills goal decomposition (e.g. Blender)
  const skillsRoadmap = await decomposeGoalIntoRoadmap({
    title: "Learn Blender 3D Hard-Surface Modeling",
    description: "Design portfolio asset for architectural visualization",
    category: "skills",
    targetDate: "2026-11-30",
  });

  assert(skillsRoadmap.length === 3, "Skills goal decomposed into 3 milestones");
  assert(skillsRoadmap[1].title.includes("Capstone"), "Phase 2 focuses on hands-on capstone project");

  // Test 3: Career goal decomposition
  const careerRoadmap = await decomposeGoalIntoRoadmap({
    title: "Lead Production Microservices Migration",
    description: "Scale infrastructure to 50k concurrent requests",
    category: "career",
    targetDate: "2026-12-31",
  });

  assert(careerRoadmap.length === 3, "Career goal decomposed into 3 phases");
  assert(careerRoadmap[0].actionableTasks![0].difficulty === "high", "Technical spec has high cognitive difficulty");

  console.log("=================================================");
  console.log(`TEST RESULTS: ${passed}/${total} PASSED`);
  console.log("=================================================");
}

runRoadmapTests();
