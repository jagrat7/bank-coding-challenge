import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { env } from '~/env';
import { generateText, streamText } from 'ai';

async function page() {
    const openrouter = createOpenRouter({
        apiKey: env.OPENROUTER_API_KEY,
    });
    console.log(openrouter)
    let text = 'bs'
    const { text: newText } = await generateText({
        model: openrouter.chat('deepseek/deepseek-chat'),
        prompt: 'What model are u?',
    });

    console.log(newText);

    return (
        <div>
            <p>{text}</p> 
            <p>-------------------</p>  
            <p>{newText}</p>
        </div>
    )
}

export default page