import json
import re

def fix_json(input_file, output_file):
    output = []

    with open(input_file, "r", encoding="utf-8") as f:
        for line in f:
            # Исправляем {$date: "..."} -> {"$date": "..."}
            line = re.sub(r'\{\$date: "([^"]+)"\}', r'{"$date": "\1"}', line)
            try:
                doc = json.loads(line)
                output.append(doc)
            except json.JSONDecodeError as e:
                print(f"[{input_file}] Ошибка разбора строки: {e}")
                print("Строка:", line)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

# Обрабатываем оба файла
fix_json("users.json", "users_fixed.json")
fix_json("posts.json", "posts_fixed.json")

