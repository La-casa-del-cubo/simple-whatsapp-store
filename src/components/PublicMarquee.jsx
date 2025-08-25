import { useState, useEffect, useContext } from "react";
import DOMPurify from "dompurify";
import { SupabaseContext } from "../contexts/SupabaseContext";

export default function PublicMarquee() {
    const supabase = useContext(SupabaseContext);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        supabase
            .from("marquee_config")
            .select("*")
            .limit(1)
            .single()
            .then(({ data }) => {
                if (data?.message) {
                    // Sanitizar el HTML recibido
                    const cleanHTML = DOMPurify.sanitize(data.message, {
                        ALLOWED_TAGS: ['b','i','em','strong','u','a','span'], // etiquetas permitidas
                        ALLOWED_ATTR: ['href', 'title', 'target', 'style'], // atributos permitidos
                    });

                    // Reemplazamos saltos de línea, párrafos por espacios para una línea sin rupturas
                    const singleLineHTML = cleanHTML
                        .replace(/<\/p><p>/g, ' ')
                        .replace(/<p>/g, '')
                        .replace(/<\/p>/g, '')
                        .replace(/<br\s*\/?>/g, ' ');

                    setConfig({ ...data, sanitizedMessage: singleLineHTML });
                } else {
                    setConfig(data);
                }
            });
    }, [supabase]);

    if (!config || !config.sanitizedMessage) return null;

    return (
        <div
            style={{
                backgroundColor: config.background_color,
                color: config.color,
            }}
            className="overflow-hidden whitespace-nowrap select-none"
            aria-label="Mensaje destacado"
        >
            <marquee className="py-2 px-4 text-lg font-semibold" scrollamount="6">
                <span dangerouslySetInnerHTML={{ __html: config.sanitizedMessage }} />
            </marquee>
        </div>
    );
}
