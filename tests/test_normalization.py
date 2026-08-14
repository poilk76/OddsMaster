import pytest

from collector.core.normalization import Normalizer
from collector.core.normalization import NormalizerConfig

class TestNormalization:

    normalizer = Normalizer()

    @pytest.mark.parametrize(
        "text, expected",
        [
            ('vfl \x0c{hcska 7]\tot/U ', '\x0chcska 7\totu'), 
            ('borussia na E3PB}[%,hk!n&A/x8;gMW%WG|sk \x0bS\r\tk', 'e3pbhknax8gmwwgsk \x0bs\r\tk'),
            ('mfk I?T*icw5R%"M{\'OR\x0c', 'iticw5rmor'), 
            ('S\r.%<W:l,`|#sUNVRAI,\rfhh\r#"', 's\rwlsunvrai\rfhh\r'), 
            ('cska lnqJoUX=34hl~CY$4h8&s(8polisportiva ELK qRBt{=fk ', 'lnqjoux34hlcy4h8s8polisportiva elk qrbtfk'), 
            ('[G(O\tp-=Y#.*:town d~&q*)\nYSk7U%ysL$=)pJw', 'go\tpytown dq\nysk7uyslpjw'), 
            ('XL%57_5Q:\x0c[$(qD\nm>z?2\x0b', 'xl575q\x0cqd\nmz2'), 
            (')B\x0b\x0c@u=[sz>SE1PB\rXl*&DQ\tA0P2PBz8Y?Zse bk %)+:M', 'b\x0b\x0cuszse1pb\rxldq\ta0p2pbz8yzse m'), 
            ('i!orB*y]\x0c(Kl\tm*i!f=F\x0c3\x0c\r|', 'iorby\x0ckl\tmiff\x0c3\x0c\r'), 
            ('torpedo XdK\x0b\t2rlQ]T3#iHK)X_h\'e~.~Sh\x0bD]]P\n^9 )\rwN>"3Wc?n%.m\t', 'xdk\x0b\t2rlqt3ihkxhesh\x0bdp\n9 \rwn3wcnm'), 
            ('YvScpmfk G|e2\thYJ\\!@ =@!zkf=łks ', 'yvscpmfk ge2\thyj zkflks'), 
            ('asd forest esporte clube msk ', 'esporte clube'), 
            ('\\-^Z<C #O+9%w5\\_yU Ju0h^%c<oT7n_\x0b24h+ik N&d:7tiN', 'zc o9w5yu ju0hcot7n\x0b24hik nd7tin'), 
            ('$\\mc cXB\x0b>łks cd /;dT\rf5dJa:\r)fk ', 'cxb\x0blks dt\rf5dja\rfk'), 
            ('atletico "\r[Ohu!2Zn+Rr\x0bih[8~e7royal k22]y<#4|nVK=l:6', '\rohu2znrr\x0bih8e7royal k22y4nvkl6'), 
            ('atlético shakhtar 40#"]jRD*W7wgCXj=Dl:8GrN', '40jrdw7wgcxjdl8grn'), 
            ('vfl ks  G8uz%<&kh<Is^Zx\nWsc *4pBeR_h', ' g8uzkhiszx\nwsc 4pberh'), 
            ('0XrYbB<w"."[SFY=6', '0xrybbwsfy6'), 
            ('*:$fsI2a|)(J"hc~@gcf$clWb7YQw', 'fsi2ajhcgcfclwb7yqw'), 
            ("05\x0cBxq LJ3se Yp\r?Cim7d''Smt", '05\x0cbxq lj3se yp\rcim7dsmt'), 
            ('étoile sportive l~\\=\x0c[7\r[\nrL.>Kd>TQ ?1L\r|5\r.^B4HhC6uM~Cg]0,', 'l\x0c7\r\nrlkdtq 1l\r5\rb4hhc6umcg0'), 
            ("42Dn\x0cr=#ST\t\\xY$F'-7o{x}s\x0b*`4", '42dn\x0crst\txyf7oxs\x0b4'), 
            ('6:;/tM+`<+LY*w^_!Tv/calcio *L;|N6?', '6tmlywtvcalcio ln6'), 
            ("UV=5J`mfk taxtg[^}6uathletico nXb'#W/W3*Gj*i", 'uv5jmfk taxtg6uathletico nxbww3gji'), 
            ('rcd U\x0c0\x0bp<@i;@=^e5#%V@wd<qs/]b4=CC\rwu#', 'u\x0c0\x0bpie5vwdqsb4cc\rwu')
        ]
    )
    def test_some_random_cases(self,text:str,expected:str):

        assert self.normalizer.normalize(text) == expected

    @pytest.mark.parametrize(
        "text, expected, config",
        [
            ("FC Randóm, Words 2026","Random Words",NormalizerConfig(lower=False)),
            ("FC Randóm, Words 2026","fc random words",NormalizerConfig(remove_aliases=False)),
            ("FC Randóm, Words 2026","random, words",NormalizerConfig(remove_punctuation=False)),
            ("FC Randóm, Words 2026","random words 2026",NormalizerConfig(remove_numbers=False)),
            ("FC Randóm, Words 2026","randóm words",NormalizerConfig(remove_accents=False)),
            ("FC Random, Words 2026","fc random",NormalizerConfig(aliases=('words'))),
        ]
    )
    def test_config_edition(self,text:str,expected:str,config:Normalizer):

        self.normalizer.config = config

        assert self.normalizer.normalize(text) == expected

    normalizer.config = NormalizerConfig()

    def test_wrong_type_input(self):

        assert self.normalizer.normalize(20) == ""