const APP_DATA = {
    patterns: {
        "arrays-hashing": {
            name: "Arrays & Hashing",
            recognition: "Data is ordered or you need fast O(1) lookups. Often the foundation for more complex patterns.",
            keywords: ["frequency", "duplicates", "count", "pair", "sum"],
            template: `// Frequency Map Template
const map = new Map();
for (let num of nums) {
    map.set(num, (map.get(num) || 0) + 1);
}`,
            mentalModel: "Think of an array as a bookshelf. Hashing is a magical index that tells you exactly which shelf a book is on.",
            complexity: "Usually O(N) Time, O(N) Space."
        },
        "two-pointer": {
            name: "Two Pointer",
            recognition: "Array is sorted or you need to process pairs from both ends. Can also be used to find a cycle (Fast & Slow).",
            keywords: ["sorted", "pair", "sum", "palindrome", "reverse"],
            template: `let left = 0, right = arr.length - 1;
while (left < right) {
    if (condition) right--;
    else if (other_condition) left++;
    else return true;
}`,
            mentalModel: "Imagine two fingers pointing at elements in the array, moving closer to each other to find a specific target.",
            complexity: "O(N) Time, O(1) Space."
        },
        "sliding-window": {
            name: "Sliding Window",
            recognition: "Problem asks for a contiguous subset (subarray/substring) that meets a condition (longest, shortest, sum).",
            keywords: ["longest", "shortest", "subarray", "substring", "contiguous"],
            template: `let left = 0, maxLength = 0;
for (let right = 0; right < arr.length; right++) {
    // add arr[right] to state
    while (state_is_invalid) {
        // remove arr[left] from state
        left++;
    }
    maxLength = Math.max(maxLength, right - left + 1);
}`,
            mentalModel: "Think of a caterpillar moving across a leaf. It stretches its head forward, and pulls its tail forward when it gets too long.",
            complexity: "O(N) Time, Space depends on state (often O(1) or O(K))."
        },
        "prefix-sum": {
            name: "Prefix Sum",
            recognition: "Problem involves multiple queries for the sum of a subarray, or finding subarrays that sum to a specific value.",
            keywords: ["subarray sum", "cumulative", "range query"],
            template: `let prefix = 0;
const map = new Map(); // stores prefix sums and frequencies
map.set(0, 1);
for (let num of nums) {
    prefix += num;
    if (map.has(prefix - target)) {
        count += map.get(prefix - target);
    }
    map.set(prefix, (map.get(prefix) || 0) + 1);
}`,
            mentalModel: "If you know the sum of all elements up to index J, and the sum up to index I, the sum from I to J is (Sum[J] - Sum[I]).",
            complexity: "O(N) Time, O(N) Space."
        },
        "dynamic-programming": {
            name: "Dynamic Programming",
            recognition: "Problem asks for the optimal (max/min) solution, or the total number of ways, and decisions have overlapping subproblems.",
            keywords: ["maximum", "minimum", "ways", "longest", "combinations"],
            template: `const memo = new Map();
function dfs(i) {
    if (base_case) return result;
    if (memo.has(i)) return memo.get(i);
    let res = make_decision(i);
    memo.set(i, res);
    return res;
}`,
            mentalModel: "Solve a complex problem by breaking it down into simpler subproblems and remembering the answers to those subproblems.",
            complexity: "O(States * Transitions) Time, O(States) Space."
        }
    },
    
    problems: {
        // ARRAYS & HASHING
        "contains-duplicate": {
            id: "contains-duplicate",
            name: "Contains Duplicate",
            lcNumber: 217,
            difficulty: "Easy",
            estimatedTime: 15,
            pattern: "Arrays & Hashing",
            prerequisites: ["Arrays"],
            unlocks: ["Valid Anagram", "Two Sum"],
            companies: ["Apple", "Microsoft", "Amazon"],
            whyToday: "The most fundamental hash set problem. Teaches O(1) lookups vs O(N) search.",
            concept: "Use a HashSet to keep track of elements you have seen so far.",
            mistakes: ["Using nested loops yielding O(N^2) time complexity."],
            hint: "Can you insert elements into a Set and check if the size is smaller than the array length?",
            complexity: { time: "O(N)", space: "O(N)" }
        },
        "valid-anagram": {
            id: "valid-anagram",
            name: "Valid Anagram",
            lcNumber: 242,
            difficulty: "Easy",
            estimatedTime: 15,
            pattern: "Arrays & Hashing",
            prerequisites: ["Arrays"],
            unlocks: ["Group Anagrams"],
            companies: ["Google", "Uber", "Bloomberg"],
            whyToday: "Introduces frequency mapping, a core concept for counting problems.",
            concept: "Count the frequency of each character in string s, then decrement based on string t.",
            mistakes: ["Sorting the strings takes O(N log N). A frequency map takes O(N)."],
            hint: "An array of size 26 can be used instead of a HashMap since we only have lowercase English letters.",
            complexity: { time: "O(N)", space: "O(1)" }
        },
        "two-sum": {
            id: "two-sum",
            name: "Two Sum",
            lcNumber: 1,
            difficulty: "Easy",
            estimatedTime: 20,
            pattern: "Arrays & Hashing",
            prerequisites: ["Arrays"],
            unlocks: ["3Sum"],
            companies: ["Amazon", "Google", "Facebook", "Apple"],
            whyToday: "The classic interview question. Teaches storing the *needed* complement in a map.",
            concept: "As you iterate, calculate \`target - current_num\` and check if it exists in the HashMap.",
            mistakes: ["Using the same element twice (check index)."],
            hint: "What if you store the numbers you've seen so far in a hash map mapping number to index?",
            complexity: { time: "O(N)", space: "O(N)" }
        },
        "group-anagrams": {
            id: "group-anagrams",
            name: "Group Anagrams",
            lcNumber: 49,
            difficulty: "Medium",
            estimatedTime: 30,
            pattern: "Arrays & Hashing",
            prerequisites: ["Valid Anagram"],
            unlocks: ["Top K Frequent Elements"],
            companies: ["Amazon", "Microsoft", "eBay"],
            whyToday: "Tests your ability to use complex keys in HashMaps.",
            concept: "Use a character count array (or sorted string) as a unique key for the HashMap.",
            mistakes: ["Sorting each string yields O(N * K log K). An array key yields O(N * K)."],
            hint: "Since letters are a-z, you can create a 26-length array and convert it to a string to use as a dictionary key.",
            complexity: { time: "O(N * K)", space: "O(N * K)" }
        },

        // TWO POINTERS
        "valid-palindrome": {
            id: "valid-palindrome",
            name: "Valid Palindrome",
            lcNumber: 125,
            difficulty: "Easy",
            estimatedTime: 15,
            pattern: "Two Pointer",
            prerequisites: ["Strings"],
            unlocks: ["Two Sum II"],
            companies: ["Facebook", "Spotify", "Microsoft"],
            whyToday: "The fundamental two-pointer problem.",
            concept: "One pointer at the start, one at the end. Move them inward while skipping non-alphanumeric chars.",
            mistakes: ["Not handling empty strings or strings with only spaces.", "Using regex replacement which allocates O(N) extra memory."],
            hint: "IscharAlphaNumeric(char) can be checked using ASCII codes to stay purely O(1) space.",
            complexity: { time: "O(N)", space: "O(1)" }
        },
        "two-sum-ii": {
            id: "two-sum-ii",
            name: "Two Sum II",
            lcNumber: 167,
            difficulty: "Medium",
            estimatedTime: 20,
            pattern: "Two Pointer",
            prerequisites: ["Two Sum"],
            unlocks: ["3Sum"],
            companies: ["Amazon"],
            whyToday: "Shows how sorted data changes the optimal approach from Hashing to Two Pointers.",
            concept: "Because it's sorted, if sum is too large, decrement right pointer. If too small, increment left.",
            mistakes: ["Using a hashmap (uses O(N) space instead of O(1))."],
            hint: "The array is already sorted. Where are the largest numbers? Where are the smallest?",
            complexity: { time: "O(N)", space: "O(1)" }
        },
        "3sum": {
            id: "3sum",
            name: "3Sum",
            lcNumber: 15,
            difficulty: "Medium",
            estimatedTime: 35,
            pattern: "Two Pointer",
            prerequisites: ["Two Sum II"],
            unlocks: ["Container With Most Water"],
            companies: ["Facebook", "Amazon", "Apple"],
            whyToday: "Combines sorting, loop iteration, and Two Sum II.",
            concept: "Sort the array. Iterate \`i\`, and for the remaining array, use Two Sum II to find target \`-nums[i]\`.",
            mistakes: ["Producing duplicate triplets. Must skip duplicate \`i\`, \`left\`, and \`right\` elements."],
            hint: "Sort first. To avoid duplicates, if nums[i] == nums[i-1], continue.",
            complexity: { time: "O(N^2)", space: "O(1)" }
        },

        // SLIDING WINDOW
        "buy-and-sell-crypto": { // Best time to buy and sell stock
            id: "buy-and-sell-crypto",
            name: "Best Time to Buy & Sell Stock",
            lcNumber: 121,
            difficulty: "Easy",
            estimatedTime: 15,
            pattern: "Sliding Window",
            prerequisites: ["Arrays"],
            unlocks: ["Longest Substring Without Repeating Characters"],
            companies: ["Amazon", "Google", "Facebook"],
            whyToday: "Introduction to keeping track of a dynamic minimum (left pointer).",
            concept: "Keep track of the lowest price seen so far. The max profit is the max of (current_price - lowest_price).",
            mistakes: ["Trying to find the absolute max and min simultaneously."],
            hint: "You have to buy before you sell. If you see a new low, update your buy day.",
            complexity: { time: "O(N)", space: "O(1)" }
        },
        "longest-substring": {
            id: "longest-substring",
            name: "Longest Substring Without Repeating Characters",
            lcNumber: 3,
            difficulty: "Medium",
            estimatedTime: 30,
            pattern: "Sliding Window",
            prerequisites: ["Arrays & Hashing"],
            unlocks: ["Longest Repeating Character Replacement"],
            companies: ["Amazon", "Microsoft", "Bloomberg"],
            whyToday: "The quintessential variable-sized sliding window problem.",
            concept: "Use a Set to track characters in the current window. If a duplicate is found, shrink window from the left until duplicate is removed.",
            mistakes: ["Forgetting to remove elements from the set when shrinking.", "Not updating the max length at every valid step."],
            hint: "If you encounter a character already in your set, your current window is invalid. How do you make it valid again?",
            complexity: { time: "O(N)", space: "O(min(N, M))" }
        },
        "character-replacement": {
            id: "character-replacement",
            name: "Longest Repeating Character Replacement",
            lcNumber: 424,
            difficulty: "Medium",
            estimatedTime: 35,
            pattern: "Sliding Window",
            prerequisites: ["Longest Substring Without Repeating Characters"],
            unlocks: ["Minimum Window Substring"],
            companies: ["Google", "Uber"],
            whyToday: "Introduces window validation based on complex states (max frequency count).",
            concept: "Window Length - Max Frequency Count = Characters to Replace. If this > k, shrink window.",
            mistakes: ["Recalculating the max frequency dynamically instead of keeping track of the historical max frequency (which works)."],
            hint: "You don't need to decrement the \`maxFrequency\` count when the window shrinks, because a smaller maxFrequency won't give a longer valid window.",
            complexity: { time: "O(N)", space: "O(26) -> O(1)" }
        },
        "minimum-window-substring": {
            id: "minimum-window-substring",
            name: "Minimum Window Substring",
            lcNumber: 76,
            difficulty: "Hard",
            estimatedTime: 45,
            pattern: "Sliding Window",
            prerequisites: ["Longest Substring Without Repeating Characters"],
            unlocks: [],
            companies: ["Facebook", "LinkedIn", "Airbnb"],
            whyToday: "Mastery of Sliding Window. Multiple maps and variables.",
            concept: "Keep a frequency map of string T. Expand right until valid. Then shrink left to find minimum.",
            mistakes: ["Using full map comparison instead of 'have' and 'need' counter variables."],
            hint: "Use a \`have\` integer and a \`need\` integer. When \`have == need\`, the window is valid.",
            complexity: { time: "O(N)", space: "O(N)" }
        },

        // PREFIX SUM
        "subarray-sum-equals-k": {
            id: "subarray-sum-equals-k",
            name: "Subarray Sum Equals K",
            lcNumber: 560,
            difficulty: "Medium",
            estimatedTime: 35,
            pattern: "Prefix Sum",
            prerequisites: ["Arrays & Hashing"],
            unlocks: ["Continuous Subarray Sum"],
            companies: ["Facebook", "Google"],
            whyToday: "Core prefix sum problem combined with hashing.",
            concept: "Maintain a running sum. Check if \`current_sum - k\` exists in the hash map of previous prefix sums.",
            mistakes: ["Forgetting to initialize the hash map with \`{0: 1}\`."],
            hint: "If the current prefix sum is 10, and k is 3, you are looking for a previous prefix sum of 7.",
            complexity: { time: "O(N)", space: "O(N)" }
        },
        
        // DYNAMIC PROGRAMMING
        "climbing-stairs": {
            id: "climbing-stairs",
            name: "Climbing Stairs",
            lcNumber: 70,
            difficulty: "Easy",
            estimatedTime: 15,
            pattern: "Dynamic Programming",
            prerequisites: ["Recursion"],
            unlocks: ["House Robber"],
            companies: ["Amazon", "Apple"],
            whyToday: "The absolute basic intro to 1D Dynamic Programming (Fibonacci).",
            concept: "Ways(n) = Ways(n-1) + Ways(n-2). Optimize space to O(1) using two variables.",
            mistakes: ["Using plain recursion yields O(2^N) time."],
            hint: "To reach step 5, you must step from step 4 or step 3.",
            complexity: { time: "O(N)", space: "O(1)" }
        },
        "house-robber": {
            id: "house-robber",
            name: "House Robber",
            lcNumber: 198,
            difficulty: "Medium",
            estimatedTime: 25,
            pattern: "Dynamic Programming",
            prerequisites: ["Climbing Stairs"],
            unlocks: ["House Robber II", "Decode Ways"],
            companies: ["Google", "Amazon"],
            whyToday: "Introduces DP decisions: Rob this house (and skip prev) OR Skip this house (take prev max).",
            concept: "Max(rob + arr[i], not_rob). Store only the last two calculations.",
            mistakes: ["Not optimizing space. An array is not needed."],
            hint: "At house i, you either rob it (money[i] + max_profit_at_i-2) or don't rob it (max_profit_at_i-1).",
            complexity: { time: "O(N)", space: "O(1)" }
        }
    },
    
    // Generates a 42-day curriculum map
    curriculum: [],
    
    skillTreeNodes: [
        { id: "arrays", label: "Arrays", x: 400, y: 100, unlocks: ["two-pointer", "hashing"] },
        { id: "two-pointer", label: "Two Pointer", x: 250, y: 250, unlocks: ["sliding-window"] },
        { id: "hashing", label: "HashMap", x: 550, y: 250, unlocks: ["prefix-sum"] },
        { id: "sliding-window", label: "Sliding Window", x: 250, y: 400, unlocks: ["variable-window"] },
        { id: "prefix-sum", label: "Prefix Sum", x: 550, y: 400, unlocks: ["dp"] },
        { id: "variable-window", label: "Variable Window", x: 250, y: 550, unlocks: [] },
        { id: "dp", label: "Dynamic Programming", x: 550, y: 550, unlocks: ["1d-dp"] },
        { id: "1d-dp", label: "1D DP", x: 550, y: 700, unlocks: [] }
    ],

    badges: [
        { id: "first-blood", name: "First Blood", desc: "Solve your first problem.", icon: "droplet" },
        { id: "streak-7", name: "Consistent", desc: "Maintain a 7-day streak.", icon: "flame" },
        { id: "array-master", name: "Array Apprentice", desc: "Master the Arrays pattern.", icon: "box" },
        { id: "window-master", name: "Sliding Window Master", desc: "Complete all Sliding Window problems.", icon: "maximize" },
        { id: "boss-slayer", name: "Boss Slayer", desc: "Defeat your first Sunday Boss Battle.", icon: "sword" },
        { id: "halfway", name: "Halfway There", desc: "Reach Day 21.", icon: "flag" },
        { id: "interview-ready", name: "Interview Ready", desc: "Complete the 42-Day Curriculum.", icon: "award" }
    ]
};

// Procedurally generate the 42 day curriculum to populate the array
function generateCurriculum() {
    const days = [];
    
    // Seed real problems for the first few days
    const problemPool = [
        { m: ["contains-duplicate"], b: ["valid-anagram", "two-sum"] }, // Day 1
        { m: ["valid-palindrome"], b: ["two-sum-ii", "3sum"] }, // Day 2
        { m: ["buy-and-sell-crypto"], b: ["longest-substring", "character-replacement"] }, // Day 3
        { m: ["subarray-sum-equals-k"], b: ["two-sum", "contains-duplicate"], isRevision: true }, // Day 4 (Revision)
        { m: ["climbing-stairs"], b: ["house-robber", "two-sum-ii"] }, // Day 5
        { m: ["minimum-window-substring"], b: ["group-anagrams", "3sum"] }, // Day 6 (Weekend)
        { m: ["minimum-window-substring"], b: ["longest-substring", "house-robber"], isBoss: true } // Day 7 (Boss)
    ];

    for (let i = 1; i <= 42; i++) {
        let type = "regular";
        if (i % 7 === 0) type = "boss";
        else if (i % 4 === 0) type = "revision";
        
        let poolItem = problemPool[(i - 1) % problemPool.length];
        
        // For placeholder days, we'll reuse the pool but mark them differently
        days.push({
            day: i,
            type: type,
            patternId: i <= 7 ? Object.keys(APP_DATA.patterns)[(i-1) % 5] : "dynamic-programming", // Just dummy assigning patterns
            mandatory: poolItem.m,
            bonus: poolItem.b
        });
    }
    
    APP_DATA.curriculum = days;
}

generateCurriculum();
