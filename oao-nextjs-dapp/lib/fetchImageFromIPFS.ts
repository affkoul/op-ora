import axios from "axios";

export async function fetchImageFromIPFS(
  ipfsUrl: string,
): Promise<string | null> {
  try {
    const response = await axios.get(
      `/api/proxy?ipfsUrl=${encodeURIComponent(ipfsUrl)}`,
      {
        responseType: "blob",
      },
    );
    // console.log("response");
    // console.log(response);
    // Create an object URL to use in the Image component
    const imageUrl = URL.createObjectURL(response.data);
    return imageUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}
