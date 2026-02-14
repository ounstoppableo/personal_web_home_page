import $$ from "jquery";

export function judgeSeason() {
  const month = new Date().getMonth();
  if (month === 10 || month === 11 || month === 0) {
    return "Winter";
  } else if (month === 7 || month === 8 || month === 9) {
    return "Autumn";
  } else if (month === 4 || month === 5 || month === 6) {
    return "Summer";
  } else {
    return "Spring";
  }
}

//因为设计原因，maxSize不能大于25px
export function seasonSelect(type: "Spring" | "Summer" | "Autumn" | "Winter") {
  if (!(window as any).$) (window as any).$ = $$;
  if (!(window as any).$.snowfall) {
    (window as any).Snowfall((window as any).$);
  }
  ((window as any).$(document) as any).snowfall("");
  requestAnimationFrame(() => {
    if (type === "Spring") {
      ((window as any).$(document) as any).snowfall({
        image:
          "https://cdn.jsdelivr.net/gh/ounstoppableo/season_float_animation@vlatest/img/1.png",
        flakeCount: 2,
        minSpeed: 1,
        maxSpeed: 2,
        minSize: 8,
        maxSize: 25,
      });
      ((window as any).$(document) as any).snowfall({
        image:
          "https://cdn.jsdelivr.net/gh/ounstoppableo/season_float_animation@vlatest/img/2.png",
        flakeCount: 2,
        minSpeed: 1,
        maxSpeed: 2,
        minSize: 8,
        maxSize: 25,
      });
      ((window as any).$(document) as any).snowfall({
        image:
          "https://cdn.jsdelivr.net/gh/ounstoppableo/season_float_animation@vlatest/img/3.png",
        flakeCount: 2,
        minSpeed: 1,
        maxSpeed: 2,
        minSize: 8,
        maxSize: 25,
      });
      ((window as any).$(document) as any).snowfall({
        image:
          "https://cdn.jsdelivr.net/gh/ounstoppableo/season_float_animation@vlatest/img/4.png",
        flakeCount: 2,
        minSpeed: 1,
        maxSpeed: 2,
        minSize: 8,
        maxSize: 25,
      });
    } else if (type === "Summer") {
      ((window as any).$(document) as any).snowfall({
        icon: "🍀",
        flakeCount: 8,
        minSpeed: 1,
        maxSpeed: 2,
        minSize: 8,
        maxSize: 25,
      });
    } else if (type === "Autumn") {
      ((window as any).$(document) as any).snowfall({
        icon: "🍁",
        flakeCount: 8,
        minSpeed: 1,
        maxSpeed: 2,
        minSize: 8,
        maxSize: 25,
      });
    } else if (type === "Winter") {
      ((window as any).$(document) as any).snowfall({
        image: "assets/ParticleSmoke.png",
        flakeCount: 4,
        minSpeed: 1,
        maxSpeed: 2,
        minSize: 8,
        maxSize: 25,
        noRotate: true,
      });
      ((window as any).$(document) as any).snowfall({
        image: "assets/ParticleSmoke2.png",
        flakeCount: 4,
        minSpeed: 1,
        maxSpeed: 2,
        minSize: 8,
        maxSize: 25,
        noRotate: true,
      });
    }
  });
}

export function closedFloat() {
  if (!(window as any).$) (window as any).$ = $$;
  if (!(window as any).$.snowfall) {
    (window as any).Snowfall((window as any).$);
  }
  ((window as any).$(document) as any).snowfall("");
}
