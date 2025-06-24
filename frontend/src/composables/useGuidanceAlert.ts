// import { computed, ref } from 'vue'

// const alerts = ref([
//   {
//     id: 1,
//     title: 'Vitamin D Deficiency',
//     description: 'Your child has low levels of vitamin D.',
//     type: 'warning',
//     suggestions: [
//       {
//         id: 1,
//         title: 'Suggestions',
//         content:
//           'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
//       },
//       {
//         id: 2,
//         title: 'Suggestions',
//         content:
//           'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula. Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: 'Vitamin D Deficiency',
//     description: 'Your child has low levels of vitamin D.',
//     type: 'warning',
//     suggestions: [
//       {
//         id: 1,
//         title: 'Suggestions',
//         content:
//           'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
//       },
//     ],
//   },
//   {
//     id: 3,
//     title: 'Vitamin D Deficiency',
//     description: 'Your child has low levels of vitamin D.',
//     type: 'warning',
//     suggestions: [
//       {
//         id: 1,
//         title: 'Suggestions',
//         content:
//           'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
//       },
//     ],
//   },
//   {
//     id: 4,
//     title: 'Vitamin D Deficiency',
//     description: 'Your child has low levels of vitamin D.',
//     type: 'warning',
//     suggestions: [
//       {
//         id: 1,
//         title: 'Suggestions',
//         content:
//           'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
//       },
//     ],
//   },
// ])

// export function useGuidanceAlert() {
//   const removeAlert = (id: number) => {
//     alerts.value = alerts.value.filter((alert) => alert.id !== id)
//   }

//   const alertsCount = computed(() => alerts.value.length)

//   return {
//     alerts,
//     removeAlert,
//     alertsCount,
//   }
// }


// src/composables/useGuidanceAlert.ts
import { computed, ref } from 'vue'

const alerts = ref([
  {
    id: 1,
    title: 'Gradual Meal Intake Decrease Detected',
    description: 'Breakfast consumption has decreased by 50% over 5 days',
    type: 'warning',
    suggestions: [
      {
        id: 1,
        title: 'Monitor for Early Signs',
        content:
          'Watch for signs of illness such as runny nose, cough, or increased fussiness. Teething can also cause decreased appetite, so check for swollen gums, drooling, or desire to chew on objects. These symptoms often appear before appetite changes become noticeable.',
      },
      {
        id: 2,
        title: 'Offer Preferred Foods',
        content:
          'During periods of decreased appetite, focus on offering foods your child typically enjoys and finds comforting. Consider softer textures if teething is suspected, or cooler foods if a sore throat might be developing. Small, frequent offerings may be more appealing than large portions.',
      },
      {
        id: 3,
        title: 'Check for Throat Discomfort',
        content:
          'Gently feel around your child\'s neck for any swollen lymph nodes, and observe if they seem to have difficulty or pain when swallowing. If they refuse foods they normally enjoy, especially harder or more textured items, this could indicate throat irritation or soreness.',
      },
    ],
  },
  {
    id: 2,
    title: 'Sleep Duration Changes Detected',
    description: 'Sleep has decreased by 1.5 hours on average over the past 5 nights',
    type: 'warning',
    suggestions: [
      {
        id: 1,
        title: 'Environmental Check',
        content:
          'Examine your child\'s sleep environment for potential disturbances. Check room temperature (ideal range 68-70°F), ensure blackout curtains are working properly, and listen for new noises that might be disrupting sleep. Even small changes like a new neighbor, construction nearby, or seasonal changes in daylight can affect sleep patterns.',
      },
      {
        id: 2,
        title: 'Physical Comfort Assessment',
        content:
          'Look for signs of physical discomfort that might be interrupting sleep. This includes checking for diaper rashes, tight-fitting pajamas, or signs of teething pain. Growth spurts can also cause temporary discomfort as bones and muscles stretch, particularly affecting sleep quality.',
      },
      {
        id: 3,
        title: 'Review Recent Changes',
        content:
          'Consider any recent changes to your child\'s routine, diet, or environment. New foods, changes in nap times, different caregivers, or even minor illness recovery can temporarily affect sleep patterns. Maintaining consistency in bedtime routines becomes even more important during these periods.',
      },
    ],
  },
  {
    id: 3,
    title: 'Stool Consistency Changes Detected',
    description: 'Stool has been progressively becoming softer over the past 3 bowel movements',
    type: 'warning',
    suggestions: [
      {
        id: 1,
        title: 'Hydration Monitoring',
        content:
          'Ensure your child is getting adequate fluids, but also monitor for signs of dehydration if loose stools continue. Offer breast milk, formula, or small sips of water more frequently. Watch for signs like decreased urination, dry mouth, or unusual fussiness that might indicate fluid loss.',
      },
      {
        id: 2,
        title: 'Dietary Review',
        content:
          'Review any new foods introduced in the past few days, as well as changes in quantity or timing of meals. Sometimes increased fruit intake, different formula preparation, or even stress can affect digestion. Keep a simple food log to identify potential triggers if the pattern continues.',
      },
      {
        id: 3,
        title: 'Illness Monitoring',
        content:
          'Be alert for other signs of illness such as fever, decreased appetite, unusual fussiness, or changes in activity level. Digestive changes can be early indicators of viral infections or other conditions. Contact your pediatrician if loose stools persist beyond a day or two, or if other symptoms develop.',
      },
    ],
  },
  {
    id: 4,
    title: 'Growth Plateau Detected',
    description: 'Weight has remained stable across the past 3 measurements over recent weeks',
    type: 'info',
    suggestions: [
      {
        id: 1,
        title: 'Nutritional Assessment',
        content:
          'Review your child\'s daily nutritional intake to ensure they\'re getting adequate calories and nutrients for their age. Growth plateaus are often normal, but it\'s important to maintain proper nutrition during these periods. Consider whether recent illness, increased activity, or changes in appetite might be affecting their intake.',
      },
      {
        id: 2,
        title: 'Activity and Development',
        content:
          'Children often experience growth plateaus during periods of increased physical activity or major developmental milestones. If your child is learning to walk, talk, or mastering new skills, their energy may be directed toward development rather than growth. This is typically temporary and normal.',
      },
      {
        id: 3,
        title: 'Growth Pattern Context',
        content:
          'Remember that children grow in spurts rather than continuously. Some children may have longer plateaus followed by rapid growth periods. Keep tracking measurements and discuss the pattern with your pediatrician at your next visit to ensure it fits within your child\'s individual growth curve.',
      },
    ],
  },
  {
    id: 5,
    title: 'Increased Night Wakings Detected',
    description: 'More frequent night wakings have been observed over the past 3 nights',
    type: 'warning',
    suggestions: [
      {
        id: 1,
        title: 'Teething Assessment',
        content:
          'Check for signs of teething, which commonly causes increased night wakings. Look for swollen or red gums, increased drooling, desire to chew on objects, and slight changes in eating patterns. Teething pain often worsens at night when children are lying down, making sleep more difficult.',
      },
      {
        id: 2,
        title: 'Sleep Environment Optimization',
        content:
          'Evaluate room temperature, noise levels, and comfort items. Sometimes small environmental changes can significantly impact sleep quality. Ensure your child\'s sleepwear is appropriate for the temperature, and consider whether seasonal changes might be affecting their comfort.',
      },
      {
        id: 3,
        title: 'Routine Consistency',
        content:
          'Maintain consistent bedtime routines even when sleep is disrupted. Avoid creating new sleep associations that might be difficult to break later. If you need to provide comfort, try to do so in ways that don\'t require your presence for your child to fall back asleep.',
      },
    ],
  },
  {
    id: 6,
    title: 'Persistent Low-Grade Symptoms',
    description: 'Low-grade fever and fatigue have been consistently observed over the past 3 days',
    type: 'error',
    suggestions: [
      {
        id: 1,
        title: 'Schedule Medical Consultation',
        content:
          'Contact your pediatrician to discuss the persistent symptoms. While low-grade fevers can be normal during illness recovery or teething, persistent symptoms lasting more than 2-3 days warrant professional evaluation. Keep a log of temperatures, timing, and any other symptoms to share with your healthcare provider.',
      },
      {
        id: 2,
        title: 'Temperature Monitoring',
        content:
          'Check your child\'s temperature regularly (every 4-6 hours) and keep a record. Note the time, temperature reading, and any medications given. Watch for patterns - some children have slightly higher temperatures in the evening, which can be normal. However, consistent elevation over several days needs medical attention.',
      },
      {
        id: 3,
        title: 'Comfort and Hydration',
        content:
          'Ensure your child stays well-hydrated with breast milk, formula, or small amounts of water as appropriate for their age. Offer comfort measures like lukewarm baths, light clothing, and extra cuddles. Monitor for signs of dehydration or worsening symptoms while awaiting medical guidance.',
      },
    ],
  },
])

export function useGuidanceAlert() {
  const removeAlert = (id: number) => {
    alerts.value = alerts.value.filter((alert) => alert.id !== id)
  }

  const alertsCount = computed(() => alerts.value.length)

  return {
    alerts,
    removeAlert,
    alertsCount,
  }
}