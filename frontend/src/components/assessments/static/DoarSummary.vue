
<template>
  <div class="assessment-report">
    <h2 class="justify-center text-center">
      Distribution of Assessment Results (DOAR) Summary - Report Description
    </h2>
    <h1>Description</h1>
    <p>
      This report lists the distribution of graduation assessment results for an assessment session for BC and Yukon.
      Specifically, the proportion of students achieving various assessment scores, and the number of participating students are listed.
    </p>

    <h1>Included</h1>
    <ul>
      <li>The selected assessment session</li>
      <li>Provincial totals - all BC schools (both public and independent) and all Yukon public schools, except for Non-Independent First Nations schools.</li>
      <li>All Public totals - all public BC and Yukon schools, except for Non-Independent First Nations schools.</li>
      <li>District totals - public schools only. Within the District, except for Non-Independent First Nations schools.</li>
    </ul>

    <h1>Excluded</h1>
    <ul>
      <li>Results for Aegrotats and Disqualifications</li>
      <li>Results where the student has exceeded the number of allowable writes for the assessment.</li>
    </ul>

    <h1>Definitions</h1>
    <h1
      style="font-size: 1.0em"
      class="mb-n1 mt-2"
    >
      Proficiency Scores
    </h1>
    <ul>
      <li><strong>"1" = Emerging</strong></li>
      <li><strong>"2" = Developing</strong></li>
      <li><strong>"3" = Proficient</strong></li>
      <li><strong>"4" = Extending</strong></li>
      <li><strong>"NC" = Student did not complete enough of the assessment</strong></li>
    </ul>

    <h1>School Types</h1>
    <p>
      <strong>Public School</strong> - A body of students, teachers, other staff, and facilities organized as a unit for educational purposes
      under the supervision of an administrative officer and administered by a district school board. This includes Online Learning Schools.
    </p>
    <p>
      <strong>Independent School</strong> - A school that is maintained and operated in British Columbia by an authority that provides an
      educational program to 10 or more school-aged students as outlined in the Independent School Act.
    </p>

    <h1>Assessment Status</h1>
    <p>
      <strong>Aegrotat Standing</strong> - the student has been excused from writing a Provincial Graduation Assessment due to
      unpredictable circumstances that render the student unable to write an assessment, even at a future session.
    </p>
    <p>
      <strong>Disqualification</strong> - an assessment is disqualified when the assessment rules are breached. No mark is given for the assessment.
    </p>

    <h1>Notes</h1>
    <ul>
      <li>The numbers in this report may differ from previous reports for a particular session, due to updates of the data.</li>
    </ul>

    <h1>Explanations</h1>
    <ul>
      <li>All assessment results relate ONLY to the specific session shown at the top of the report</li>
      <li>These results do not include Aegrotats or Disqualifications.</li>
      <li>The Provincial results include all schools in BC and Yukon (both public and independent), except Non-Independent First Nations schools.</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'DoarSummary',
  data() {
    return {
      // Component data can be added here if needed
    };
  }
};
</script>

<style scoped>
.assessment-report {
  max-width: 80em;
  margin: 0 auto;
  padding: 1.25em;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

h2{
  color: #34495e;
}

h3 {
  color: #34495e;
  margin-top: 1.25em;
  margin-bottom: 0.625em;
}

ul {
  margin: 0.625em 0;
  padding-left: 1.25em;
}

li {
  margin: 0.3125em 0;
}

p {
  margin: 0.625em 0;
  text-align: justify;
}

strong {
  color: #2c3e50;
}
</style>
