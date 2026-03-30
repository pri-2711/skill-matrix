import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import math

# Load data
df = pd.read_excel("D:/MINOR-PROJECT/skill_matrix/data/temp_review/temp_normalized_df.xlsx")

# Convert review_count
df["review_count"] = pd.to_numeric(df["review_count"], errors="coerce")

# Drop missing
df = df.dropna(subset=["rating", "duration_minutes", "review_count"])

# Outlier removal
upper_limit = df["duration_minutes"].quantile(0.99)
df = df[df["duration_minutes"] <= upper_limit]

# Log transform
df["review_count_log"] = df["review_count"].apply(
    lambda x: 0 if x == 0 else math.log10(x)
)

# ----------------------------
# PLOTS
# ----------------------------
plt.figure(figsize=(14, 10))

# 1. Rating Distribution
plt.subplot(2, 2, 1)
sns.histplot(df["rating"], bins=40, kde=True)
plt.title("Rating Distribution")
plt.xlabel("Rating")
plt.ylabel("Number of Courses")

# 2. Duration Distribution
plt.subplot(2, 2, 2)
sns.histplot(df["duration_minutes"], bins=50, kde=True)
plt.title("Duration Distribution")
plt.xlabel("Duration (minutes)")
plt.ylabel("Number of Courses")

# 3. Rating vs Review Count
plt.subplot(2, 2, 3)
plt.scatter(df["review_count_log"], df["rating"], alpha=0.5)
plt.title("Rating vs Review Count (Log Scale)")
plt.xlabel("Log10(Review Count)")
plt.ylabel("Rating")

# 4. Rating vs Duration
plt.subplot(2, 2, 4)
plt.scatter(df["duration_minutes"], df["rating"], alpha=0.5)
plt.title("Rating vs Duration")
plt.xlabel("Duration (minutes)")
plt.ylabel("Rating")

plt.tight_layout()
plt.show()

# ----------------------------
# HEATMAP
# ----------------------------
plt.figure(figsize=(6, 5))
sns.heatmap(
    df[["rating", "review_count", "duration_minutes"]].corr(),
    annot=True
)
plt.title("Correlation Heatmap")
plt.show()

print("\n===== EDA EXPLANATION =====\n")

print("1. RATING DISTRIBUTION")
print("- Most courses are rated between 4 and 5")
print("- Indicates generally positive user feedback\n")

print("2. DURATION DISTRIBUTION")
print("- Most courses are short, with fewer long-duration courses")
print("- This right-skewed pattern is common in real-world data\n")

print("3. SCATTER PLOTS")
print("- Each dot represents one course")
print("- Used to understand relationships between variables\n")

print("4. RATING vs REVIEW COUNT")
print("- X-axis uses log scale of review count")
print("- Log scale compresses large values (e.g., 10 to 100000) for better visualization")
print("- Slight positive trend → more popular courses tend to have slightly higher ratings\n")

print("5. RATING vs DURATION")
print("- No strong relationship observed between duration and rating")
print("- Course length does not significantly affect ratings\n")

print("6. DOT SHADING (TRANSPARENCY)")
print("- Darker regions indicate higher concentration of courses")
print("- Lighter regions indicate fewer data points\n")

print("7. CORRELATION HEATMAP")
print("- Shows weak correlation between variables")
print("- This is expected as rating, duration, and popularity are mostly independent\n")

print("FINAL CONCLUSION")
print("- Data shows realistic patterns and distributions")
print("- Suitable for further analysis and modeling\n")