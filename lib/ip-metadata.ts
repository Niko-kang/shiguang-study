import {z} from 'zod';

export const ipMetadataSchema=z.object({
 ip:z.string().ip().optional(),
 networkRegion:z.string().max(160).optional(),
 ipv4:z.string().ip({version:'v4'}).optional(),
 ipv6:z.string().ip({version:'v6'}).optional(),
 ipv4Region:z.string().max(160).optional(),
 ipv6Region:z.string().max(160).optional(),
 ipv4Source:z.enum(['request','probe']).optional(),
 ipv6Source:z.enum(['request','probe']).optional(),
 ipProbeVersion:z.literal(1).optional()
});
export type IpMetadata=z.infer<typeof ipMetadataSchema>;
export function pickIpMetadata(value:IpMetadata):IpMetadata{
 return Object.fromEntries(Object.keys(ipMetadataSchema.shape).filter(key=>value[key as keyof IpMetadata]!==undefined).map(key=>[key,value[key as keyof IpMetadata]]));
}
