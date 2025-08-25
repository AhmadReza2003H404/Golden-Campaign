import pandas as pd
import json
import random

# === Step 1: Read Excel file ===
df = pd.read_excel("Golden_Invitation.xlsx")

# === Step 2: Drop rows with any NA ===
df = df.dropna(how="any")

# === Step 3: Convert to list of dicts ===
records = df.to_dict(orient="records")

# === Step 4: Shuffle the records ===
random.shuffle(records)

# === Step 5: Write to JSON file ===
with open("output.json", "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=4)

print(f"✅ Successfully wrote {len(records)} records to output.json")
