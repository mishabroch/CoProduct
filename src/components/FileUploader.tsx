import React, { useState } from "react";
import { analyzeText } from "../api/deepseek";

const FileUploader: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target?.result as string);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!text) return;
    setIsLoading(true);
    try {
      const prompt = `Проанализируй этот скрипт разговора продукт-команды Planyway с пользователями через призму Advanced Jobs To Be Done (по Замесину)
Формат вывода результата - таблица:
1 пользователь - это 1 строка
столбцы:
1 Пользователь:
Имя, почта
2 When (контекст/триггер): 
- Ситуация, в которой возникает потребность
- Текущие ограничения/боли
3 Want (желаемый результат):
- Что хочет получить пользователь
4 How (критерии успеха):
- Как именно должен быть достигнут результат
- Какие особенности учитывать
5 So that (глобальная цель):
- "Чтобы что?" верхнеуровневый outcome
6 Feature requests
- Список фич, которые нужны пользователю

Правила:
Используй только цитаты пользователей
Не используй для анализа цитаты продуктовой команды (Yana, Sergey)
Избегай общих фраз, только конкретные боли из скрипта
Группируй смежные боли в один use case
Дополнительно:
Если в скрипте есть запросы на фичи (например, "Can we add vacation plans?"), выделяй их отдельным списком "Feature requests"
:
В фрмате ответа верни json файл представляющий таблицу
`;
      const result = await analyzeText({ prompt, text });
      setResponse(result);
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
      setResponse("Произошла ошибка при обработке запроса.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Загрузите файл для анализа</h2>
      <input type="file" onChange={handleFileChange} accept=".txt,.md,.json" />
      {text && (
        <div>
          <h3>Содержимое файла:</h3>
          <pre>{text}</pre>
          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Отправка..." : "Отправить в Deepseek"}
          </button>
        </div>
      )}
      {response && (
        <div>
          <h3>Ответ от Deepseek:</h3>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
