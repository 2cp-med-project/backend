import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
	url: process.env.QDRANT_URL ?? "http://localhost:6333",
	timeout: 10_000,
});

export const COLLECTION_NAME = "consultations";

let _collectionReady = false;
export async function ensureCollection() {
	if (_collectionReady) return;

	const { collections } = await qdrant.getCollections();
	if (!collections.some((c) => c.name === COLLECTION_NAME)) {
		await qdrant.createCollection(COLLECTION_NAME, {
			vectors: {
				size: 4096,
				distance: "Cosine",
				hnsw_config: {
					m: 16,
					ef_construct: 100,
					full_scan_threshold: 10_000,
				},
				quantization_config: {
					scalar: {
						type: "int8",
						quantile: 0.99,
						always_ram: true,
					},
				},
			},
		});
	}

	const INDEXED_FIELDS = [
		"patientId",
		"consultationId",
		"doctorId",
		"status",
		"date",
	];

	await Promise.all(
		INDEXED_FIELDS.map((field) =>
			qdrant
				.createPayloadIndex(COLLECTION_NAME, {
					field_name: field,
					field_schema: "keyword",
				})
				.catch((e) => {
					if (!e.message?.includes("already exists")) throw e;
				}),
		),
	);

	_collectionReady = true;
}
