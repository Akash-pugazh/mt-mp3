export function stripQueryAndHash(input: string): string {
  return input.split('?')[0]!.split('#')[0]!;
}

export function toAbsolute(baseUrl: string, href: string): string {
  return new URL(href, baseUrl).toString();
}
