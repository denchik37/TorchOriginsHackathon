'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { KDEChartModal } from './kde-chart-modal';

interface KDEChartProps {
  className?: string;
  currentPrice: number;
  enableZoom?: boolean;
}

// Default data structure matching the chart.js implementation
const defaultData = [
  {
   "targetTimestamp": 1754525794,
   "betWeight": 0.00867,
   "priceMin": 0.2676,
   "priceMax": 0.2754
  },
  {
   "targetTimestamp": 1754528022,
   "betWeight": 0.03155,
   "priceMin": 0.2737,
   "priceMax": 0.2775
  },
  {
   "targetTimestamp": 1754530122,
   "betWeight": 0.02296,
   "priceMin": 0.2664,
   "priceMax": 0.2804
  },
  {
   "targetTimestamp": 1754537352,
   "betWeight": 0.01946,
   "priceMin": 0.2647,
   "priceMax": 0.281
  },
  {
   "targetTimestamp": 1754538954,
   "betWeight": 0.00644,
   "priceMin": 0.2715,
   "priceMax": 0.2828
  },
  {
   "targetTimestamp": 1754539314,
   "betWeight": 0.07809999999999999,
   "priceMin": 0.2792,
   "priceMax": 0.2823
  },
  {
   "targetTimestamp": 1754540652,
   "betWeight": 0.05874,
   "priceMin": 0.2732,
   "priceMax": 0.2885
  },
  {
   "targetTimestamp": 1754543411,
   "betWeight": 0.02181,
   "priceMin": 0.2638,
   "priceMax": 0.2764
  },
  {
   "targetTimestamp": 1754546411,
   "betWeight": 0.03613,
   "priceMin": 0.2553,
   "priceMax": 0.2736
  },
  {
   "targetTimestamp": 1754552331,
   "betWeight": 0.10328,
   "priceMin": 0.2684,
   "priceMax": 0.2825
  },
  {
   "targetTimestamp": 1754552511,
   "betWeight": 0.00618,
   "priceMin": 0.2761,
   "priceMax": 0.2803
  },
  {
   "targetTimestamp": 1754556360,
   "betWeight": 0.018359999999999998,
   "priceMin": 0.2622,
   "priceMax": 0.2769
  },
  {
   "targetTimestamp": 1754556720,
   "betWeight": 0.04904,
   "priceMin": 0.2706,
   "priceMax": 0.2804
  },
  {
   "targetTimestamp": 1754563184,
   "betWeight": 0.01598,
   "priceMin": 0.274,
   "priceMax": 0.278
  },
  {
   "targetTimestamp": 1754563244,
   "betWeight": 0.00846,
   "priceMin": 0.2627,
   "priceMax": 0.2722
  },
  {
   "targetTimestamp": 1754563292,
   "betWeight": 0.08056,
   "priceMin": 0.2711,
   "priceMax": 0.2778
  },
  {
   "targetTimestamp": 1754566412,
   "betWeight": 0.00415,
   "priceMin": 0.2768,
   "priceMax": 0.2915
  },
  {
   "targetTimestamp": 1754574780,
   "betWeight": 0.43083,
   "priceMin": 0.2233,
   "priceMax": 0.239
  },
  {
   "targetTimestamp": 1754575449,
   "betWeight": 0.01149,
   "priceMin": 0.2756,
   "priceMax": 0.2829
  },
  {
   "targetTimestamp": 1754575689,
   "betWeight": 0.004200000000000001,
   "priceMin": 0.2795,
   "priceMax": 0.2897
  },
  {
   "targetTimestamp": 1754575844,
   "betWeight": 0.04131,
   "priceMin": 0.2732,
   "priceMax": 0.2758
  },
  {
   "targetTimestamp": 1754577224,
   "betWeight": 0.34024,
   "priceMin": 0.2655,
   "priceMax": 0.2745
  },
  {
   "targetTimestamp": 1754586159,
   "betWeight": 0.0034699999999999996,
   "priceMin": 0.2629,
   "priceMax": 0.2826
  },
  {
   "targetTimestamp": 1754586629,
   "betWeight": 0.03158,
   "priceMin": 0.2668,
   "priceMax": 0.2761
  },
  {
   "targetTimestamp": 1754587469,
   "betWeight": 0.00926,
   "priceMin": 0.2679,
   "priceMax": 0.285
  },
  {
   "targetTimestamp": 1754588499,
   "betWeight": 0.019280000000000002,
   "priceMin": 0.2701,
   "priceMax": 0.288
  },
  {
   "targetTimestamp": 1754596939,
   "betWeight": 0.06599,
   "priceMin": 0.278,
   "priceMax": 0.2808
  },
  {
   "targetTimestamp": 1754599257,
   "betWeight": 0.22985,
   "priceMin": 0.2786,
   "priceMax": 0.2858
  },
  {
   "targetTimestamp": 1754599939,
   "betWeight": 0.0020099999999999996,
   "priceMin": 0.2811,
   "priceMax": 0.2913
  },
  {
   "targetTimestamp": 1754600457,
   "betWeight": 0.01298,
   "priceMin": 0.2701,
   "priceMax": 0.2827
  },
  {
   "targetTimestamp": 1754604989,
   "betWeight": 0.00749,
   "priceMin": 0.2778,
   "priceMax": 0.2829
  },
  {
   "targetTimestamp": 1754607329,
   "betWeight": 0.11476,
   "priceMin": 0.2874,
   "priceMax": 0.2909
  },
  {
   "targetTimestamp": 1754607531,
   "betWeight": 0.00269,
   "priceMin": 0.2635,
   "priceMax": 0.2855
  },
  {
   "targetTimestamp": 1754609691,
   "betWeight": 0.011800000000000001,
   "priceMin": 0.2621,
   "priceMax": 0.2763
  },
  {
   "targetTimestamp": 1754613596,
   "betWeight": 0.00318,
   "priceMin": 0.2847,
   "priceMax": 0.2933
  },
  {
   "targetTimestamp": 1754616356,
   "betWeight": 0.00163,
   "priceMin": 0.285,
   "priceMax": 0.299
  },
  {
   "targetTimestamp": 1754622782,
   "betWeight": 0.28933,
   "priceMin": 0.2891,
   "priceMax": 0.294
  },
  {
   "targetTimestamp": 1754625722,
   "betWeight": 0.0286,
   "priceMin": 0.2808,
   "priceMax": 0.2901
  },
  {
   "targetTimestamp": 1754634913,
   "betWeight": 0.01982,
   "priceMin": 0.2859,
   "priceMax": 0.2898
  },
  {
   "targetTimestamp": 1754635033,
   "betWeight": 0.12176999999999999,
   "priceMin": 0.2835,
   "priceMax": 0.2918
  },
  {
   "targetTimestamp": 1754643071,
   "betWeight": 0.004849999999999999,
   "priceMin": 0.2779,
   "priceMax": 0.2859
  },
  {
   "targetTimestamp": 1754644631,
   "betWeight": 0.0022299999999999998,
   "priceMin": 0.2829,
   "priceMax": 0.2898
  },
  {
   "targetTimestamp": 1754657567,
   "betWeight": 0.20606,
   "priceMin": 0.2754,
   "priceMax": 0.2808
  },
  {
   "targetTimestamp": 1754658522,
   "betWeight": 0.09223999999999999,
   "priceMin": 0.2688,
   "priceMax": 0.2791
  },
  {
   "targetTimestamp": 1754660267,
   "betWeight": 0.00598,
   "priceMin": 0.2775,
   "priceMax": 0.2982
  },
  {
   "targetTimestamp": 1754661942,
   "betWeight": 0.02659,
   "priceMin": 0.2715,
   "priceMax": 0.283
  },
  {
   "targetTimestamp": 1754663295,
   "betWeight": 0.00376,
   "priceMin": 0.2854,
   "priceMax": 0.2903
  },
  {
   "targetTimestamp": 1754665215,
   "betWeight": 0.0155,
   "priceMin": 0.2784,
   "priceMax": 0.2877
  },
  {
   "targetTimestamp": 1754705127,
   "betWeight": 0.012029999999999999,
   "priceMin": 0.2786,
   "priceMax": 0.2951
  },
  {
   "targetTimestamp": 1754705667,
   "betWeight": 0.04488,
   "priceMin": 0.2885,
   "priceMax": 0.2956
  },
  {
   "targetTimestamp": 1754706038,
   "betWeight": 0.06321,
   "priceMin": 0.2861,
   "priceMax": 0.2913
  },
  {
   "targetTimestamp": 1754706278,
   "betWeight": 0.013779999999999999,
   "priceMin": 0.2902,
   "priceMax": 0.2941
  },
  {
   "targetTimestamp": 1754707734,
   "betWeight": 0.18358000000000002,
   "priceMin": 0.2898,
   "priceMax": 0.2969
  },
  {
   "targetTimestamp": 1754709774,
   "betWeight": 0.06416,
   "priceMin": 0.2911,
   "priceMax": 0.2944
  },
  {
   "targetTimestamp": 1754736749,
   "betWeight": 0.00277,
   "priceMin": 0.2869,
   "priceMax": 0.2955
  },
  {
   "targetTimestamp": 1754737469,
   "betWeight": 0.00607,
   "priceMin": 0.2891,
   "priceMax": 0.3047
  },
  {
   "targetTimestamp": 1754767566,
   "betWeight": 0.00996,
   "priceMin": 0.2946,
   "priceMax": 0.3108
  },
  {
   "targetTimestamp": 1754767626,
   "betWeight": 0.01317,
   "priceMin": 0.2925,
   "priceMax": 0.2983
  },
  {
   "targetTimestamp": 1754774779,
   "betWeight": 0.19477,
   "priceMin": 0.2855,
   "priceMax": 0.2928
  },
  {
   "targetTimestamp": 1754775199,
   "betWeight": 0.003,
   "priceMin": 0.29,
   "priceMax": 0.2993
  },
  {
   "targetTimestamp": 1754776107,
   "betWeight": 0.00229,
   "priceMin": 0.2849,
   "priceMax": 0.3031
  },
  {
   "targetTimestamp": 1754777787,
   "betWeight": 0.1738,
   "priceMin": 0.292,
   "priceMax": 0.3111
  },
  {
   "targetTimestamp": 1754779380,
   "betWeight": 0.21148,
   "priceMin": 0.1936,
   "priceMax": 0.2168
  },
  {
   "targetTimestamp": 1754781153,
   "betWeight": 0.25655,
   "priceMin": 0.2847,
   "priceMax": 0.2903
  },
  {
   "targetTimestamp": 1754781993,
   "betWeight": 0.08513,
   "priceMin": 0.2865,
   "priceMax": 0.29
  },
  {
   "targetTimestamp": 1754797722,
   "betWeight": 0.1436,
   "priceMin": 0.2913,
   "priceMax": 0.3052
  },
  {
   "targetTimestamp": 1754800602,
   "betWeight": 0.01718,
   "priceMin": 0.2962,
   "priceMax": 0.3001
  },
  {
   "targetTimestamp": 1754816474,
   "betWeight": 0.03591,
   "priceMin": 0.294,
   "priceMax": 0.2991
  },
  {
   "targetTimestamp": 1754816534,
   "betWeight": 0.00043,
   "priceMin": 0.2979,
   "priceMax": 0.3026
  },
  {
   "targetTimestamp": 1754817380,
   "betWeight": 0.02572,
   "priceMin": 0.2898,
   "priceMax": 0.3072
  },
  {
   "targetTimestamp": 1754819180,
   "betWeight": 0.01671,
   "priceMin": 0.3011,
   "priceMax": 0.3042
  },
  {
   "targetTimestamp": 1754831138,
   "betWeight": 0.00147,
   "priceMin": 0.2831,
   "priceMax": 0.3021
  },
  {
   "targetTimestamp": 1754832698,
   "betWeight": 0.05422,
   "priceMin": 0.295,
   "priceMax": 0.3009
  },
  {
   "targetTimestamp": 1754835480,
   "betWeight": 0.44194,
   "priceMin": 0.2042,
   "priceMax": 0.2317
  },
  {
   "targetTimestamp": 1754838147,
   "betWeight": 0.008,
   "priceMin": 0.2796,
   "priceMax": 0.2963
  },
  {
   "targetTimestamp": 1754840847,
   "betWeight": 0.00684,
   "priceMin": 0.2916,
   "priceMax": 0.3007
  },
  {
   "targetTimestamp": 1754854801,
   "betWeight": 0.05188,
   "priceMin": 0.2972,
   "priceMax": 0.3155
  },
  {
   "targetTimestamp": 1754858101,
   "betWeight": 0.00239,
   "priceMin": 0.2935,
   "priceMax": 0.3024
  },
  {
   "targetTimestamp": 1754885706,
   "betWeight": 0.08037000000000001,
   "priceMin": 0.2956,
   "priceMax": 0.3024
  },
  {
   "targetTimestamp": 1754886906,
   "betWeight": 0.0046500000000000005,
   "priceMin": 0.3055,
   "priceMax": 0.31
  },
  {
   "targetTimestamp": 1754889219,
   "betWeight": 0.02076,
   "priceMin": 0.2879,
   "priceMax": 0.2978
  },
  {
   "targetTimestamp": 1754891499,
   "betWeight": 0.0033,
   "priceMin": 0.2973,
   "priceMax": 0.3072
  },
  {
   "targetTimestamp": 1754916149,
   "betWeight": 0.02249,
   "priceMin": 0.2919,
   "priceMax": 0.307
  },
  {
   "targetTimestamp": 1754917289,
   "betWeight": 0.00976,
   "priceMin": 0.2985,
   "priceMax": 0.3145
  },
  {
   "targetTimestamp": 1754936923,
   "betWeight": 0.01263,
   "priceMin": 0.3002,
   "priceMax": 0.3127
  },
  {
   "targetTimestamp": 1754938243,
   "betWeight": 0.02169,
   "priceMin": 0.3027,
   "priceMax": 0.3079
  },
  {
   "targetTimestamp": 1754940350,
   "betWeight": 0.06748,
   "priceMin": 0.2868,
   "priceMax": 0.2996
  },
  {
   "targetTimestamp": 1754943590,
   "betWeight": 0.00045,
   "priceMin": 0.2981,
   "priceMax": 0.3016
  },
  {
   "targetTimestamp": 1754954474,
   "betWeight": 0.08366,
   "priceMin": 0.298,
   "priceMax": 0.302
  },
  {
   "targetTimestamp": 1754956934,
   "betWeight": 0.05522,
   "priceMin": 0.2912,
   "priceMax": 0.2944
  },
  {
   "targetTimestamp": 1755008913,
   "betWeight": 0.07316,
   "priceMin": 0.3026,
   "priceMax": 0.3066
  },
  {
   "targetTimestamp": 1755010233,
   "betWeight": 0.08502,
   "priceMin": 0.3063,
   "priceMax": 0.3183
  },
  {
   "targetTimestamp": 1755012729,
   "betWeight": 0.04557,
   "priceMin": 0.3026,
   "priceMax": 0.3159
  },
  {
   "targetTimestamp": 1755014049,
   "betWeight": 0.0072699999999999996,
   "priceMin": 0.3002,
   "priceMax": 0.3102
  },
  {
   "targetTimestamp": 1755026612,
   "betWeight": 0.09162999999999999,
   "priceMin": 0.2937,
   "priceMax": 0.2998
  },
  {
   "targetTimestamp": 1755027512,
   "betWeight": 0.00631,
   "priceMin": 0.2942,
   "priceMax": 0.3107
  },
  {
   "targetTimestamp": 1755049341,
   "betWeight": 0.04057,
   "priceMin": 0.3042,
   "priceMax": 0.313
  },
  {
   "targetTimestamp": 1755052161,
   "betWeight": 0.05248,
   "priceMin": 0.3155,
   "priceMax": 0.3214
  },
  {
   "targetTimestamp": 1755060164,
   "betWeight": 0.0029699999999999996,
   "priceMin": 0.3018,
   "priceMax": 0.3167
  },
  {
   "targetTimestamp": 1755062444,
   "betWeight": 0.18096,
   "priceMin": 0.3075,
   "priceMax": 0.3144
  },
  {
   "targetTimestamp": 1755066109,
   "betWeight": 0.14758000000000002,
   "priceMin": 0.3051,
   "priceMax": 0.308
  },
  {
   "targetTimestamp": 1755069529,
   "betWeight": 0.03567,
   "priceMin": 0.3033,
   "priceMax": 0.3193
  },
  {
   "targetTimestamp": 1755078561,
   "betWeight": 0.02284,
   "priceMin": 0.2964,
   "priceMax": 0.3127
  },
  {
   "targetTimestamp": 1755079461,
   "betWeight": 0.063,
   "priceMin": 0.299,
   "priceMax": 0.3109
  },
  {
   "targetTimestamp": 1755086220,
   "betWeight": 0.21166,
   "priceMin": 0.1888,
   "priceMax": 0.2062
  },
  {
   "targetTimestamp": 1755090326,
   "betWeight": 0.02336,
   "priceMin": 0.3032,
   "priceMax": 0.3122
  },
  {
   "targetTimestamp": 1755093746,
   "betWeight": 0.01302,
   "priceMin": 0.2944,
   "priceMax": 0.3128
  },
  {
   "targetTimestamp": 1755118198,
   "betWeight": 0.031010000000000003,
   "priceMin": 0.3034,
   "priceMax": 0.3069
  },
  {
   "targetTimestamp": 1755119398,
   "betWeight": 0.011859999999999999,
   "priceMin": 0.2948,
   "priceMax": 0.3116
  },
  {
   "targetTimestamp": 1755147316,
   "betWeight": 0.0038900000000000002,
   "priceMin": 0.3009,
   "priceMax": 0.3124
  },
  {
   "targetTimestamp": 1755148396,
   "betWeight": 0.0201,
   "priceMin": 0.2981,
   "priceMax": 0.3033
  },
  {
   "targetTimestamp": 1755150343,
   "betWeight": 0.00318,
   "priceMin": 0.3099,
   "priceMax": 0.3144
  },
  {
   "targetTimestamp": 1755152623,
   "betWeight": 0.07084,
   "priceMin": 0.3062,
   "priceMax": 0.3185
  },
  {
   "targetTimestamp": 1755157617,
   "betWeight": 0.00893,
   "priceMin": 0.3065,
   "priceMax": 0.3251
  },
  {
   "targetTimestamp": 1755160137,
   "betWeight": 0.03128,
   "priceMin": 0.3071,
   "priceMax": 0.321
  },
  {
   "targetTimestamp": 1755165533,
   "betWeight": 0.00578,
   "priceMin": 0.2989,
   "priceMax": 0.3154
  },
  {
   "targetTimestamp": 1755167993,
   "betWeight": 0.27263,
   "priceMin": 0.3041,
   "priceMax": 0.3154
  },
  {
   "targetTimestamp": 1755185914,
   "betWeight": 0.04906,
   "priceMin": 0.3014,
   "priceMax": 0.3064
  },
  {
   "targetTimestamp": 1755187654,
   "betWeight": 0.05486,
   "priceMin": 0.308,
   "priceMax": 0.3177
  },
  {
   "targetTimestamp": 1755188595,
   "betWeight": 0.0010500000000000002,
   "priceMin": 0.3065,
   "priceMax": 0.3096
  },
  {
   "targetTimestamp": 1755191678,
   "betWeight": 0.00838,
   "priceMin": 0.3043,
   "priceMax": 0.3211
  },
  {
   "targetTimestamp": 1755192195,
   "betWeight": 0.46935000000000004,
   "priceMin": 0.3042,
   "priceMax": 0.3172
  },
  {
   "targetTimestamp": 1755193598,
   "betWeight": 0.00041999999999999996,
   "priceMin": 0.3077,
   "priceMax": 0.3111
  },
  {
   "targetTimestamp": 1755219874,
   "betWeight": 0.00611,
   "priceMin": 0.3043,
   "priceMax": 0.3118
  },
  {
   "targetTimestamp": 1755220954,
   "betWeight": 0.06035,
   "priceMin": 0.301,
   "priceMax": 0.3172
  },
  {
   "targetTimestamp": 1755259636,
   "betWeight": 0.29705000000000004,
   "priceMin": 0.3179,
   "priceMax": 0.3237
  },
  {
   "targetTimestamp": 1755260596,
   "betWeight": 0.00094,
   "priceMin": 0.3125,
   "priceMax": 0.3162
  },
  {
   "targetTimestamp": 1755291933,
   "betWeight": 0.11406999999999999,
   "priceMin": 0.3141,
   "priceMax": 0.3181
  },
  {
   "targetTimestamp": 1755294513,
   "betWeight": 0.03342,
   "priceMin": 0.3221,
   "priceMax": 0.3288
  },
  {
   "targetTimestamp": 1755339091,
   "betWeight": 0.00058,
   "priceMin": 0.31,
   "priceMax": 0.3181
  },
  {
   "targetTimestamp": 1755341611,
   "betWeight": 0.00871,
   "priceMin": 0.317,
   "priceMax": 0.325
  },
  {
   "targetTimestamp": 1755349698,
   "betWeight": 0.04856,
   "priceMin": 0.2974,
   "priceMax": 0.3129
  },
  {
   "targetTimestamp": 1755352938,
   "betWeight": 0.00146,
   "priceMin": 0.2997,
   "priceMax": 0.3152
  },
  {
   "targetTimestamp": 1755374418,
   "betWeight": 0.01133,
   "priceMin": 0.2957,
   "priceMax": 0.3069
  },
  {
   "targetTimestamp": 1755375138,
   "betWeight": 0.00624,
   "priceMin": 0.3016,
   "priceMax": 0.3169
  },
  {
   "targetTimestamp": 1755404318,
   "betWeight": 0.025920000000000002,
   "priceMin": 0.31,
   "priceMax": 0.3224
  },
  {
   "targetTimestamp": 1755406478,
   "betWeight": 0.0025800000000000003,
   "priceMin": 0.3158,
   "priceMax": 0.3203
  },
  {
   "targetTimestamp": 1755430767,
   "betWeight": 0.00254,
   "priceMin": 0.2996,
   "priceMax": 0.3157
  },
  {
   "targetTimestamp": 1755432567,
   "betWeight": 0.0025499999999999997,
   "priceMin": 0.2888,
   "priceMax": 0.3078
  },
  {
   "targetTimestamp": 1755448700,
   "betWeight": 0.31576,
   "priceMin": 0.3105,
   "priceMax": 0.3228
  },
  {
   "targetTimestamp": 1755451100,
   "betWeight": 0.08142,
   "priceMin": 0.3094,
   "priceMax": 0.3153
  },
  {
   "targetTimestamp": 1755494468,
   "betWeight": 0.07322,
   "priceMin": 0.3114,
   "priceMax": 0.3212
  },
  {
   "targetTimestamp": 1755495093,
   "betWeight": 0.00882,
   "priceMin": 0.3139,
   "priceMax": 0.3202
  },
  {
   "targetTimestamp": 1755496533,
   "betWeight": 0.0025099999999999996,
   "priceMin": 0.314,
   "priceMax": 0.3251
  },
  {
   "targetTimestamp": 1755497228,
   "betWeight": 0.00477,
   "priceMin": 0.3145,
   "priceMax": 0.3258
  },
  {
   "targetTimestamp": 1755549263,
   "betWeight": 0.00515,
   "priceMin": 0.3083,
   "priceMax": 0.3207
  },
  {
   "targetTimestamp": 1755552503,
   "betWeight": 0.02501,
   "priceMin": 0.3096,
   "priceMax": 0.3237
  },
  {
   "targetTimestamp": 1755586208,
   "betWeight": 0.00487,
   "priceMin": 0.3141,
   "priceMax": 0.3231
  },
  {
   "targetTimestamp": 1755586928,
   "betWeight": 0.12290000000000001,
   "priceMin": 0.3019,
   "priceMax": 0.3177
  },
  {
   "targetTimestamp": 1755595545,
   "betWeight": 0.013439999999999999,
   "priceMin": 0.3156,
   "priceMax": 0.3301
  },
  {
   "targetTimestamp": 1755597705,
   "betWeight": 0.20415,
   "priceMin": 0.3184,
   "priceMax": 0.3309
  },
  {
   "targetTimestamp": 1755640295,
   "betWeight": 0.01072,
   "priceMin": 0.3231,
   "priceMax": 0.3323
  },
  {
   "targetTimestamp": 1755641075,
   "betWeight": 0.006059999999999999,
   "priceMin": 0.3092,
   "priceMax": 0.3308
  },
  {
   "targetTimestamp": 1755705480,
   "betWeight": 0.08191,
   "priceMin": 0.39,
   "priceMax": 0.4047
  },
  {
   "targetTimestamp": 1755706159,
   "betWeight": 0.07569,
   "priceMin": 0.3147,
   "priceMax": 0.3222
  },
  {
   "targetTimestamp": 1755706928,
   "betWeight": 0.00442,
   "priceMin": 0.3184,
   "priceMax": 0.3295
  },
  {
   "targetTimestamp": 1755706939,
   "betWeight": 0.02367,
   "priceMin": 0.3182,
   "priceMax": 0.3348
  },
  {
   "targetTimestamp": 1755707888,
   "betWeight": 0.01993,
   "priceMin": 0.3275,
   "priceMax": 0.3442
  },
  {
   "targetTimestamp": 1755710228,
   "betWeight": 0.08535,
   "priceMin": 0.3221,
   "priceMax": 0.3307
  },
  {
   "targetTimestamp": 1755710468,
   "betWeight": 0.07046,
   "priceMin": 0.3145,
   "priceMax": 0.3324
  },
  {
   "targetTimestamp": 1755751703,
   "betWeight": 0.09085,
   "priceMin": 0.3236,
   "priceMax": 0.3264
  },
  {
   "targetTimestamp": 1755752423,
   "betWeight": 0.05154,
   "priceMin": 0.3224,
   "priceMax": 0.3388
  },
  {
   "targetTimestamp": 1755773639,
   "betWeight": 0.0195,
   "priceMin": 0.3243,
   "priceMax": 0.3272
  },
  {
   "targetTimestamp": 1755776339,
   "betWeight": 0.00163,
   "priceMin": 0.3197,
   "priceMax": 0.3369
  },
  {
   "targetTimestamp": 1755805201,
   "betWeight": 0.00414,
   "priceMin": 0.3213,
   "priceMax": 0.3347
  },
  {
   "targetTimestamp": 1755805861,
   "betWeight": 0.3023,
   "priceMin": 0.3215,
   "priceMax": 0.33
  },
  {
   "targetTimestamp": 1755813790,
   "betWeight": 0.01105,
   "priceMin": 0.3219,
   "priceMax": 0.3298
  },
  {
   "targetTimestamp": 1755814150,
   "betWeight": 0.0054800000000000005,
   "priceMin": 0.329,
   "priceMax": 0.3339
  },
  {
   "targetTimestamp": 1755845340,
   "betWeight": 0.24086000000000002,
   "priceMin": 0.1819,
   "priceMax": 0.1991
  },
  {
   "targetTimestamp": 1755868555,
   "betWeight": 0.00917,
   "priceMin": 0.3195,
   "priceMax": 0.3406
  },
  {
   "targetTimestamp": 1755868675,
   "betWeight": 0.26121,
   "priceMin": 0.3249,
   "priceMax": 0.3359
  },
  {
   "targetTimestamp": 1755871505,
   "betWeight": 0.027170000000000003,
   "priceMin": 0.3178,
   "priceMax": 0.3358
  },
  {
   "targetTimestamp": 1755874865,
   "betWeight": 0.06975,
   "priceMin": 0.3234,
   "priceMax": 0.3344
  },
  {
   "targetTimestamp": 1755894738,
   "betWeight": 0.09294,
   "priceMin": 0.3189,
   "priceMax": 0.3354
  },
  {
   "targetTimestamp": 1755898218,
   "betWeight": 0.07703,
   "priceMin": 0.3215,
   "priceMax": 0.3392
  },
  {
   "targetTimestamp": 1755946290,
   "betWeight": 0.02036,
   "priceMin": 0.3261,
   "priceMax": 0.3311
  },
  {
   "targetTimestamp": 1755948990,
   "betWeight": 0.24644,
   "priceMin": 0.3139,
   "priceMax": 0.3304
  },
  {
   "targetTimestamp": 1755951830,
   "betWeight": 0.02866,
   "priceMin": 0.3304,
   "priceMax": 0.3366
  },
  {
   "targetTimestamp": 1755953150,
   "betWeight": 0.2711,
   "priceMin": 0.3211,
   "priceMax": 0.3316
  },
  {
   "targetTimestamp": 1755969143,
   "betWeight": 0.00312,
   "priceMin": 0.3281,
   "priceMax": 0.3326
  },
  {
   "targetTimestamp": 1755972203,
   "betWeight": 0.11972,
   "priceMin": 0.3209,
   "priceMax": 0.329
  },
  {
   "targetTimestamp": 1755998670,
   "betWeight": 0.019129999999999998,
   "priceMin": 0.324,
   "priceMax": 0.3346
  },
  {
   "targetTimestamp": 1755999450,
   "betWeight": 0.00132,
   "priceMin": 0.3218,
   "priceMax": 0.3372
  },
  {
   "targetTimestamp": 1756029057,
   "betWeight": 0.12844999999999998,
   "priceMin": 0.3328,
   "priceMax": 0.3398
  },
  {
   "targetTimestamp": 1756030857,
   "betWeight": 0.06973,
   "priceMin": 0.3257,
   "priceMax": 0.3349
  },
  {
   "targetTimestamp": 1756031220,
   "betWeight": 0.15397,
   "priceMin": 0.2044,
   "priceMax": 0.2146
  },
  {
   "targetTimestamp": 1756056272,
   "betWeight": 0.00652,
   "priceMin": 0.318,
   "priceMax": 0.3359
  },
  {
   "targetTimestamp": 1756059692,
   "betWeight": 0.16234,
   "priceMin": 0.3285,
   "priceMax": 0.3385
  },
  {
   "targetTimestamp": 1756101688,
   "betWeight": 0.00725,
   "priceMin": 0.3292,
   "priceMax": 0.3344
  },
  {
   "targetTimestamp": 1756104928,
   "betWeight": 0.11605,
   "priceMin": 0.3184,
   "priceMax": 0.3355
  },
  {
   "targetTimestamp": 1756157733,
   "betWeight": 0.015619999999999998,
   "priceMin": 0.3309,
   "priceMax": 0.3449
  },
  {
   "targetTimestamp": 1756158595,
   "betWeight": 0.00628,
   "priceMin": 0.3288,
   "priceMax": 0.343
  },
  {
   "targetTimestamp": 1756159713,
   "betWeight": 0.01308,
   "priceMin": 0.3267,
   "priceMax": 0.3349
  },
  {
   "targetTimestamp": 1756160875,
   "betWeight": 0.00188,
   "priceMin": 0.334,
   "priceMax": 0.3451
  },
  {
   "targetTimestamp": 1756201513,
   "betWeight": 0.12384999999999999,
   "priceMin": 0.3337,
   "priceMax": 0.3434
  },
  {
   "targetTimestamp": 1756204093,
   "betWeight": 0.02754,
   "priceMin": 0.3399,
   "priceMax": 0.355
  },
  {
   "targetTimestamp": 1756211065,
   "betWeight": 0.16338,
   "priceMin": 0.3282,
   "priceMax": 0.3427
  },
  {
   "targetTimestamp": 1756213045,
   "betWeight": 0.00663,
   "priceMin": 0.3278,
   "priceMax": 0.3444
  },
  {
   "targetTimestamp": 1756251013,
   "betWeight": 0.01418,
   "priceMin": 0.3249,
   "priceMax": 0.34
  },
  {
   "targetTimestamp": 1756253833,
   "betWeight": 0.009380000000000001,
   "priceMin": 0.333,
   "priceMax": 0.3455
  },
  {
   "targetTimestamp": 1756302119,
   "betWeight": 0.05298,
   "priceMin": 0.3368,
   "priceMax": 0.3489
  },
  {
   "targetTimestamp": 1756302479,
   "betWeight": 0.14,
   "priceMin": 0.339,
   "priceMax": 0.3573
  },
  {
   "targetTimestamp": 1756309780,
   "betWeight": 0.02729,
   "priceMin": 0.3301,
   "priceMax": 0.3478
  },
  {
   "targetTimestamp": 1756311280,
   "betWeight": 0.0012,
   "priceMin": 0.3342,
   "priceMax": 0.3381
  },
  {
   "targetTimestamp": 1756315894,
   "betWeight": 0.039130000000000005,
   "priceMin": 0.3437,
   "priceMax": 0.3578
  },
  {
   "targetTimestamp": 1756318474,
   "betWeight": 0.01692,
   "priceMin": 0.3396,
   "priceMax": 0.3531
  },
  {
   "targetTimestamp": 1756393919,
   "betWeight": 0.01268,
   "priceMin": 0.3388,
   "priceMax": 0.3449
  },
  {
   "targetTimestamp": 1756394759,
   "betWeight": 0.1417,
   "priceMin": 0.3396,
   "priceMax": 0.3524
  },
  {
   "targetTimestamp": 1756413273,
   "betWeight": 0.0035,
   "priceMin": 0.3286,
   "priceMax": 0.348
  },
  {
   "targetTimestamp": 1756413273,
   "betWeight": 0.12326999999999999,
   "priceMin": 0.3392,
   "priceMax": 0.3536
  },
  {
   "targetTimestamp": 1756416180,
   "betWeight": 0.42611,
   "priceMin": 0.3353,
   "priceMax": 0.3509
  },
  {
   "targetTimestamp": 1756419060,
   "betWeight": 0.03705,
   "priceMin": 0.3359,
   "priceMax": 0.3528
  },
  {
   "targetTimestamp": 1756425780,
   "betWeight": 0.20937999999999998,
   "priceMin": 0.3704,
   "priceMax": 0.3829
  },
  {
   "targetTimestamp": 1756460266,
   "betWeight": 0.1026,
   "priceMin": 0.3413,
   "priceMax": 0.346
  },
  {
   "targetTimestamp": 1756460647,
   "betWeight": 0.022690000000000002,
   "priceMin": 0.3387,
   "priceMax": 0.3485
  },
  {
   "targetTimestamp": 1756461106,
   "betWeight": 0.06327,
   "priceMin": 0.3308,
   "priceMax": 0.3483
  },
  {
   "targetTimestamp": 1756461925,
   "betWeight": 0.004860000000000001,
   "priceMin": 0.3434,
   "priceMax": 0.347
  },
  {
   "targetTimestamp": 1756463305,
   "betWeight": 0.02495,
   "priceMin": 0.3325,
   "priceMax": 0.3415
  },
  {
   "targetTimestamp": 1756463827,
   "betWeight": 0.00428,
   "priceMin": 0.335,
   "priceMax": 0.34
  },
  {
   "targetTimestamp": 1756559375,
   "betWeight": 0.05004,
   "priceMin": 0.3367,
   "priceMax": 0.3564
  },
  {
   "targetTimestamp": 1756561425,
   "betWeight": 0.02689,
   "priceMin": 0.3416,
   "priceMax": 0.3553
  },
  {
   "targetTimestamp": 1756561475,
   "betWeight": 0.12863,
   "priceMin": 0.3399,
   "priceMax": 0.3595
  },
  {
   "targetTimestamp": 1756562863,
   "betWeight": 0.0039,
   "priceMin": 0.3407,
   "priceMax": 0.3479
  },
  {
   "targetTimestamp": 1756564425,
   "betWeight": 0.06035,
   "priceMin": 0.3416,
   "priceMax": 0.3558
  },
  {
   "targetTimestamp": 1756565203,
   "betWeight": 0.07901000000000001,
   "priceMin": 0.3297,
   "priceMax": 0.3457
  },
  {
   "targetTimestamp": 1756641444,
   "betWeight": 0.008490000000000001,
   "priceMin": 0.3413,
   "priceMax": 0.3492
  },
  {
   "targetTimestamp": 1756644564,
   "betWeight": 0.0042699999999999995,
   "priceMin": 0.3395,
   "priceMax": 0.3447
  },
  {
   "targetTimestamp": 1756659839,
   "betWeight": 0.00643,
   "priceMin": 0.3441,
   "priceMax": 0.3566
  },
  {
   "targetTimestamp": 1756661023,
   "betWeight": 0.027510000000000003,
   "priceMin": 0.3414,
   "priceMax": 0.3608
  },
  {
   "targetTimestamp": 1756661383,
   "betWeight": 0.00453,
   "priceMin": 0.3457,
   "priceMax": 0.3603
  },
  {
   "targetTimestamp": 1756663079,
   "betWeight": 0.00218,
   "priceMin": 0.3382,
   "priceMax": 0.3554
  },
  {
   "targetTimestamp": 1756703485,
   "betWeight": 0.00601,
   "priceMin": 0.3423,
   "priceMax": 0.3542
  },
  {
   "targetTimestamp": 1756704865,
   "betWeight": 0.0089,
   "priceMin": 0.347,
   "priceMax": 0.3513
  },
  {
   "targetTimestamp": 1756710784,
   "betWeight": 0.0007099999999999999,
   "priceMin": 0.3442,
   "priceMax": 0.348
  },
  {
   "targetTimestamp": 1756712764,
   "betWeight": 0.11845,
   "priceMin": 0.3525,
   "priceMax": 0.3591
  },
  {
   "targetTimestamp": 1756731134,
   "betWeight": 0.0011,
   "priceMin": 0.345,
   "priceMax": 0.3536
  },
  {
   "targetTimestamp": 1756734434,
   "betWeight": 0.00198,
   "priceMin": 0.3412,
   "priceMax": 0.357
  }
 ];

export function KDEChart({ className, currentPrice, enableZoom = false }: KDEChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const d3Container = useRef({ initialized: false }).current;

  useEffect(() => {
    if (!chartContainerRef.current || !defaultData || defaultData.length === 0) {
      return;
    }

    const processData = (rawData: any[]) => {
      const now = Date.now();
      return rawData.map(d => ({
        time: new Date(d.targetTimestamp * 1000), // Convert seconds to Date object
        price: (d.priceMin + d.priceMax) / 2,
        stake: d.betWeight
      })).filter(d => d.time > new Date()); // Filter for future dates only
    };

    const dataset = processData(defaultData);
    if (dataset.length === 0) return; // Don't render if no future data

    const container = chartContainerRef.current;
    // Reduced margins for compact display
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(container).selectAll("*").remove();

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
    svg.append("defs").append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    const chartArea = svg.append("g")
      .attr("clip-path", `url(#${clipId})`);

    // Add more padding to the domain to "zoom out"
    const timeExtent = d3.extent(dataset, d => d.time.getTime());
    const priceExtent = d3.extent(dataset, d => d.price);
    
    // Check if extents are valid
    if (!timeExtent[0] || !timeExtent[1] || !priceExtent[0] || !priceExtent[1]) {
      return; // Exit if we don't have valid data ranges
    }
    
    const [minTime, maxTime] = timeExtent;
    const timePadding = (maxTime - minTime) * 0.3; // 30% padding for more space

    const [minPrice, maxPrice] = priceExtent;
    const pricePadding = (maxPrice - minPrice) * 0.3; // 30% padding for more space

    const x = d3.scaleTime()
      .domain([new Date(minTime - timePadding), new Date(maxTime + timePadding)])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([minPrice - pricePadding, maxPrice + pricePadding])
      .range([height, 0]);
    
    const stakeExtent = d3.extent(dataset, d => d.stake);
    if (!stakeExtent[0] || !stakeExtent[1]) return;
    const opacityScale = d3.scaleLinear().domain([stakeExtent[0], stakeExtent[1]]).range([0.3, 1.0]);

    // Add zoom behavior if enabled
    if (enableZoom) {
      const zoom = d3.zoom()
        .scaleExtent([0.5, 10]) // Allow zoom from 0.5x to 10x
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", (event) => {
          const { transform } = event;
          
          // Update scales with zoom transform
          const xZoomed = transform.rescaleX(x);
          const yZoomed = transform.rescaleY(y);
          
          // Clear and redraw axes to avoid DOM manipulation issues
          svg.selectAll(".axis").remove();
          
          // Redraw grid lines
          svg.append("g")
            .attr("class", "axis grid-x")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xZoomed).tickSize(-height).tickFormat(() => "") as any)
            .selectAll("line")
            .attr("stroke", "#374151")
            .attr("stroke-opacity", 0.3);
          
          svg.append("g")
            .attr("class", "axis grid-y")
            .call(d3.axisLeft(yZoomed).tickSize(-width).tickFormat(() => "") as any)
            .selectAll("line")
            .attr("stroke", "#374151")
            .attr("stroke-opacity", 0.3);
          
          // Redraw main axes
          svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xZoomed).ticks(width / 80).tickFormat((d: any) => d3.timeFormat("%b %d")(d as Date)).tickSizeOuter(0) as any)
            .selectAll("text")
            .attr("fill", "#9CA3AF")
            .attr("font-size", "10px");
          
          svg.append("g")
            .attr("class", "axis y-axis")
            .call(d3.axisLeft(yZoomed).ticks(height / 40).tickFormat((d: any) => d3.format("$.3f")(d)) as any)
            .selectAll("text")
            .attr("fill", "#9CA3AF")
            .attr("font-size", "10px");
          
          // Update density plot with new scales
          const densityDataZoomed = d3.contourDensity()
            .x(d => xZoomed(new Date(d[0])))
            .y(d => yZoomed(d[1]))
            .size([width, height])
            .bandwidth(25)
            .weight((d: [number, number]) => {
              const index = densityPoints.findIndex(point => point[0] === d[0] && point[1] === d[1]);
              return index >= 0 ? dataset[index].stake : 1;
            })(densityPoints);
          
          // Update density visualization
          chartArea.selectAll("path").remove();
          
          // Re-add density layers with zoomed data
          chartArea.append("g").selectAll("path").data(densityDataZoomed).enter().append("path")
            .attr("d", d3.geoPath())
            .attr("fill", d => densityColor(d.value))
            .attr("fill-opacity", 0.8)
            .style("filter", "drop-shadow(0 0 8px rgba(71, 144, 202, 0.6))");
          
          chartArea.append("g").selectAll("path").data(densityDataZoomed).enter().append("path")
            .attr("d", d3.geoPath())
            .attr("fill", d => densityColor(d.value))
            .attr("fill-opacity", 0.3)
            .style("filter", "blur(4px)");
          
          // Update confidence contours
          const confidenceThreshold = (maxDensityValue || 0) * 0.25;
          const confidenceContours = densityDataZoomed.filter(d => d.value > confidenceThreshold);
          chartArea.append("g").selectAll("path.confidence").data(confidenceContours).enter().append("path")
            .attr("class", "confidence")
            .attr("d", d3.geoPath())
            .attr("fill", "rgb(34 197 94 / 0.3)")
            .attr("stroke", "rgb(34 197 94)")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 0.5);
          
          // Update red markers
          chartArea.selectAll("line").remove();
          chartArea.append("g").selectAll("line").data(dataset).enter().append("line")
            .attr("x1", d => xZoomed(d.time))
            .attr("y1", d => yZoomed(d.price - 0.0003))
            .attr("x2", d => xZoomed(d.time))
            .attr("y2", d => yZoomed(d.price + 0.0003))
            .attr("stroke", "#EF4444")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", d => Math.max(0.6, opacityScale(d.stake)))
            .style("filter", "drop-shadow(0 0 3px rgba(239, 68, 68, 0.8))")
            .on("mouseover", (event, d) => {
              const dateStr = d.time.toLocaleDateString();
              const timeStr = d.time.toLocaleTimeString();
              tooltip.style("opacity", 1).html(`Price: $${d.price.toFixed(4)}<br>Date: ${dateStr}<br>Time: ${timeStr}<br>Stake: ${d.stake.toFixed(0)}`).style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 10}px`);
            })
            .on("mouseout", () => tooltip.style("opacity", 0));
        });
      
      // Apply zoom to the main SVG with proper type casting
      d3.select(container).select("svg").call(zoom as any);
    }

    // Simplified grid with dark theme colors
    svg.append("g").attr("class", "axis grid-x").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickSize(-height).tickFormat(() => "")).selectAll("line").attr("stroke", "#374151").attr("stroke-opacity", 0.3);
    svg.append("g").attr("class", "axis grid-y").call(d3.axisLeft(y).tickSize(-width).tickFormat(() => "")).selectAll("line").attr("stroke", "#374151").attr("stroke-opacity", 0.3);
    
    // Axes with dark theme styling
    svg.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(width / 80).tickFormat((d: any) => d3.timeFormat("%b %d")(d)).tickSizeOuter(0))
      .selectAll("text").attr("fill", "#9CA3AF").attr("font-size", "10px");
    svg.append("g").attr("class", "axis y-axis").call(d3.axisLeft(y).ticks(height / 40).tickFormat((d: any) => d3.format("$.3f")(d)))
      .selectAll("text").attr("fill", "#9CA3AF").attr("font-size", "10px");

    // Smaller axis labels
    svg.append("text").attr("text-anchor", "middle").attr("x", width / 2).attr("y", height + margin.bottom - 5).text("Date").attr("fill", "#9CA3AF").attr("font-size", "10px");
    svg.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -margin.left + 15).text("Price (USD)").attr("fill", "#9CA3AF").attr("font-size", "10px");

    // Convert dataset to the format expected by contourDensity
    const densityPoints = dataset.map(d => [d.time.getTime(), d.price] as [number, number]);
    const densityData = d3.contourDensity()
      .x(d => x(new Date(d[0])))
      .y(d => y(d[1]))
      .size([width, height])
      .bandwidth(25)
      .weight((d: [number, number]) => {
        const index = densityPoints.findIndex(point => point[0] === d[0] && point[1] === d[1]);
        return index >= 0 ? dataset[index].stake : 1;
      })(densityPoints);
    
    // Use blue color scheme for glowy, smoky effect with #4790ca variants
    const maxDensityValue = d3.max(densityData, d => d.value);
    if (!maxDensityValue) return;
    
    // Create custom color interpolator using #4790ca variants
    const customBlueInterpolator = (t: number) => {
      // Start with a lighter variant of #4790ca and interpolate to the base color
      const lightBlue = d3.color("#8BB8E8")!; // Lighter variant of #4790ca
      const baseBlue = d3.color("#4790ca")!;
      const darkBlue = d3.color("#2A5A8A")!; // Darker variant of #4790ca
      
      if (t < 0.5) {
        // Interpolate from light to base blue
        return d3.interpolate(lightBlue, baseBlue)(t * 2);
      } else {
        // Interpolate from base to dark blue
        return d3.interpolate(baseBlue, darkBlue)((t - 0.5) * 2);
      }
    };
    
    const densityColor = d3.scaleSequential(customBlueInterpolator)
      .domain([0, maxDensityValue]);

    // Add glowy, smoky effect with multiple layers
    chartArea.append("g").selectAll("path").data(densityData).enter().append("path")
      .attr("d", d3.geoPath())
      .attr("fill", d => densityColor(d.value))
      .attr("fill-opacity", 0.8)
      .style("filter", "drop-shadow(0 0 8px rgba(71, 144, 202, 0.6))");

    // Add additional smoky layer for depth
    chartArea.append("g").selectAll("path").data(densityData).enter().append("path")
      .attr("d", d3.geoPath())
      .attr("fill", d => densityColor(d.value))
      .attr("fill-opacity", 0.3)
      .style("filter", "blur(4px)");

    const confidenceThreshold = maxDensityValue * 0.25;
    const confidenceContours = densityData.filter(d => d.value > confidenceThreshold);
    chartArea.append("g").selectAll("path.confidence").data(confidenceContours).enter().append("path").attr("d", d3.geoPath()).attr("fill", "rgb(34 197 94 / 0.3)").attr("stroke", "rgb(34 197 94)").attr("stroke-linejoin", "round").attr("stroke-width", 0.5);

    // Enhanced tooltip for compact display
    const tooltip = d3.select(container).append("div").attr("class", "absolute z-10 p-2 text-xs text-white bg-neutral-800 rounded border border-neutral-700 pointer-events-none transition-opacity duration-200").style("opacity", 0);
    
    // Make red markers more visible with enhanced styling
    chartArea.append("g").selectAll("line").data(dataset).enter().append("line")
      .attr("x1", d => x(d.time))
      .attr("y1", d => y(d.price - 0.0003)) // Slightly longer lines
      .attr("x2", d => x(d.time))
      .attr("y2", d => y(d.price + 0.0003))
      .attr("stroke", "#EF4444")
      .attr("stroke-width", 2) // Thicker stroke
      .attr("stroke-opacity", d => Math.max(0.6, opacityScale(d.stake))) // Minimum opacity
      .style("filter", "drop-shadow(0 0 3px rgba(239, 68, 68, 0.8))") // Red glow effect
      .on("mouseover", (event, d) => {
        const dateStr = d.time.toLocaleDateString();
        const timeStr = d.time.toLocaleTimeString();
        tooltip.style("opacity", 1).html(`Price: $${d.price.toFixed(4)}<br>Date: ${dateStr}<br>Time: ${timeStr}<br>Stake: ${d.stake.toFixed(0)}`).style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    // Simplified crosshair
    const focus = svg.append("g").attr("class", "focus").style("display", "none");
    focus.append("line").attr("class", "crosshair").attr("y1", 0).attr("y2", height).attr("stroke", "#6B7280").attr("stroke-width", 0.5).attr("stroke-dasharray", "2,2");
    focus.append("line").attr("class", "crosshair").attr("x1", 0).attr("x2", width).attr("stroke", "#6B7280").attr("stroke-width", 0.5).attr("stroke-dasharray", "2,2");

    // Compact metrics panel
    const metricsPanel = d3.select(container).append("div")
      .attr("class", "absolute top-2 right-2 p-2 bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 rounded text-xs text-neutral-300 pointer-events-none transition-opacity duration-300")
      .style("opacity", 0);

    svg.append("rect").attr("width", width).attr("height", height).style("fill", "none").style("pointer-events", "all")
      .on("mouseover", () => { focus.style("display", null); metricsPanel.style("opacity", 1); })
      .on("mouseout", () => { focus.style("display", "none"); metricsPanel.style("opacity", 0); })
      .on("mousemove", mousemove);

    function mousemove(event: any) {
      const [pointerX, pointerY] = d3.pointer(event, event.currentTarget);
      focus.selectAll(".crosshair").style("display", "block");
      focus.select("line.crosshair[y1='0']").attr("x1", pointerX).attr("x2", pointerX);
      focus.select("line.crosshair[x1='0']").attr("y1", pointerY).attr("y2", pointerY);

      const timeVal = x.invert(pointerX);
      const priceVal = y.invert(pointerY);
      
      const radius = 30; // Smaller radius for compact display
      const nearbyPoints = dataset.filter(d => {
        const dx = x(d.time) - pointerX;
        const dy = y(d.price) - pointerY;
        return dx * dx + dy * dy < radius * radius;
      });

      let metricsHtml = `<div class="font-semibold text-neutral-200 mb-2">Live Metrics</div>`;
      metricsHtml += `<div class="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
        <span class="font-medium text-neutral-400">Date:</span> <span class="text-right">${timeVal.toLocaleDateString()}</span>
        <span class="font-medium text-neutral-400">Time:</span> <span class="text-right">${timeVal.toLocaleTimeString()}</span>
        <span class="font-medium text-neutral-400">Price:</span> <span class="text-right">$${priceVal.toFixed(4)}</span>
      </div>`;

      if (nearbyPoints.length > 0) {
         const avgPrice = d3.mean(nearbyPoints, d => d.price);
         const avgStake = d3.mean(nearbyPoints, d => d.stake);
         
         metricsHtml += `<div class="border-t border-neutral-600 my-2"></div>
         <div class="font-semibold text-neutral-200 mb-2">Nearby Bets (${nearbyPoints.length})</div>
         <div class="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
            <span class="font-medium text-neutral-400">Avg Price:</span> <span class="text-right">$${avgPrice?.toFixed(4) || '0.0000'}</span>
            <span class="font-medium text-neutral-400">Avg Stake:</span> <span class="text-right">${avgStake?.toFixed(0) || '0'}</span>
         </div>`;
      }
      metricsPanel.html(metricsHtml);
    }

  }, [defaultData]); // Effect dependency on data

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-neutral-400">
          Price prediction distribution by date
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs h-7 px-2 text-neutral-400 hover:text-neutral-200 border-neutral-600 hover:border-neutral-500"
        >
          <Maximize2 className="h-3 w-3 mr-1" />
          Expand
        </Button>
      </div>
      <div ref={chartContainerRef} className="w-full h-full relative" />
      
      <KDEChartModal
        currentPrice={currentPrice}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
