import { useState, useEffect } from "react";

export function useImageUrls(filePaths, supabase) {
    const [urls, setUrls] = useState([]);

    useEffect(() => {
        if (!filePaths.length) {
            setUrls([]);
            return;
        }
        // Si el bucket es público:
        const publicUrls = filePaths.map(filePath => {
            const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
            return data?.publicUrl;
        });
        setUrls(publicUrls);


        // Si el bucket es privado, usar createSignedUrl (descomenta si usas bucket privado):
        // Promise.all(
        //     filePaths.map(async filePath => {
        //         const { data, error } = await supabase.storage.from("product-images").createSignedUrl(filePath, 3600);
        //         return data?.signedUrl || "";
        //     })
        // ).then(setUrls);

    }, [filePaths, supabase]);
    return urls;
}