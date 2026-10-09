import type { Connection } from "home-assistant-js-websocket";
import type { MediaBrowser, MediaItem } from "../state/library";

interface BrowseChild {
  title: string;
  media_content_id: string;
  media_content_type: string;
  can_play: boolean;
  thumbnail?: string | null;
}

interface BrowseResponse {
  children?: BrowseChild[];
}

/** Reads a media player's library over Home Assistant's media_player/browse_media command. */
export function createMediaBrowser(connection: Connection): MediaBrowser {
  return {
    async browse(entityId, contentId, contentType): Promise<MediaItem[]> {
      const response = await connection.sendMessagePromise<BrowseResponse>({
        type: "media_player/browse_media",
        entity_id: entityId,
        media_content_id: contentId,
        media_content_type: contentType,
      });
      return (response.children ?? []).map((child) => ({
        id: child.media_content_id,
        title: child.title,
        type: child.media_content_type,
        thumbnail: child.thumbnail ?? null,
        canPlay: child.can_play,
      }));
    },
  };
}
